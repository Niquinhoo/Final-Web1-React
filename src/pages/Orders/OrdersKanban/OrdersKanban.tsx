import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { Order, OrderStatus, Product, User } from '../../../utils/store';
import './OrdersKanban.css';

const ORDER_STATUSES: OrderStatus[] = ['Recibido', 'En proceso', 'Listo para entregar'];

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OrdersKanban() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const draggedOrderIdRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const [ordersList, productsList, usersList] = await Promise.all([
          apiFetch<Order[]>('/orders'),
          apiFetch<Product[]>('/products'),
          apiFetch<User[]>('/users'),
        ]);
        setOrders([...ordersList].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
        setProducts(productsList);
        setUsers(usersList);
      } catch (error) {
        console.error('No se pudieron cargar los pedidos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  async function moveOrder(orderId: number, status: OrderStatus) {
    const currentOrder = orders.find((order) => order.id === orderId);
    if (!currentOrder || currentOrder.status === status) return;

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    try {
      await apiFetch<Order>(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('No se pudo actualizar el pedido:', error);
      setOrders((current) => current.map((order) => (order.id === orderId ? currentOrder : order)));
    }
  }

  return (
    <div className="orders-kanban-page">
      <div className="page-header">
        <h2 className="display-lg">Pedidos recientes</h2>
        <p className="body-lg text-secondary-color">Mové los pedidos entre estados para seguir la preparación.</p>
      </div>

      {loading ? (
        <div className="orders-empty">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">No hay pedidos registrados todavía.</div>
      ) : (
        <div className="orders-kanban" aria-label="Tablero de pedidos">
          {ORDER_STATUSES.map((status) => {
            const columnOrders = orders.filter((order) => order.status === status);
            return (
              <section
                key={status}
                className={`orders-column ${draggedOrderId ? 'is-drop-target' : ''}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedOrderIdRef.current) void moveOrder(draggedOrderIdRef.current, status);
                  draggedOrderIdRef.current = null;
                  setDraggedOrderId(null);
                }}
              >
                <div className="orders-column-header">
                  <h3>{status}</h3>
                  <span>{columnOrders.length}</span>
                </div>

                <div className="orders-column-list">
                  {columnOrders.map((order) => {
                    const user = order.userId ? userById.get(order.userId) : null;
                    return (
                      <article
                        key={order.id}
                        className="order-kanban-card"
                        draggable
                        onDragStart={() => {
                          draggedOrderIdRef.current = order.id;
                          setDraggedOrderId(order.id);
                        }}
                        onDragEnd={() => {
                          draggedOrderIdRef.current = null;
                          setDraggedOrderId(null);
                        }}
                      >
                        <div className="order-card-header">
                          <div>
                            <strong>Orden #{order.id}</strong>
                            <span>{new Date(order.createdAt).toLocaleString('es-AR')}</span>
                          </div>
                          <strong>{formatPrice(order.total)}</strong>
                        </div>

                        <div className="order-card-products">
                          {order.items.map((item) => {
                            const product = productById.get(item.productId);
                            return (
                              <span key={item.productId}>
                                {item.quantity} x {product?.title || `Producto #${item.productId}`}
                              </span>
                            );
                          })}
                        </div>

                        <div className="order-card-footer">
                          <span>{user?.name || 'Cliente invitado'}</span>
                          {order.discountCode && <small>{order.discountCode}</small>}
                        </div>

                        <label className="order-status-select">
                          Estado
                          <select value={order.status} onChange={(event) => void moveOrder(order.id, event.target.value as OrderStatus)}>
                            {ORDER_STATUSES.map((nextStatus) => (
                              <option key={nextStatus} value={nextStatus}>{nextStatus}</option>
                            ))}
                          </select>
                        </label>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
