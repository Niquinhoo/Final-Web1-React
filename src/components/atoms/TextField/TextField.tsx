import { forwardRef } from 'react';
import { useId } from '../../_md3/hooks';
import './TextField.css';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Helper text under the field. */
  supportingText?: string;
  /** Error text — when set, renders the field in the error state. */
  errorText?: string;
  /** Material Symbols icon name shown at the leading edge. */
  leadingIcon?: string;
  /** Material Symbols icon name shown at the trailing edge. */
  trailingIcon?: string;
  /** Use a <textarea> instead of an <input>. */
  multiline?: boolean;
  /** Rows for the multiline variant. */
  rows?: number;
  /** Render full width. */
  fullWidth?: boolean;
}

/**
 * MD3 Outlined Text Field with floating label.
 *
 * The label is overlaid on the outline when empty (resting) and floats up into
 * the notch when focused or filled — matching the MD3 outlined text field spec.
 */
const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  function TextField(
    {
      label,
      supportingText,
      errorText,
      leadingIcon,
      trailingIcon,
      multiline = false,
      rows = 4,
      fullWidth = false,
      className,
      id,
      value,
      defaultValue,
      placeholder,
      disabled,
      required,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId('tf');
    const fieldId = id ?? generatedId;
    const hasError = Boolean(errorText);
    const hasValue = Boolean(value ?? defaultValue);

    const wrapperClasses = [
      'md3-textfield',
      hasError ? 'is-error' : '',
      disabled ? 'is-disabled' : '',
      hasValue || placeholder ? 'is-populated' : '',
      fullWidth ? 'is-fullwidth' : '',
      leadingIcon ? 'has-leading' : '',
      trailingIcon ? 'has-trailing' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const sharedProps = {
      id: fieldId,
      disabled,
      required,
      placeholder,
      value,
      defaultValue,
      className: leadingIcon || trailingIcon ? undefined : undefined, // see below
      ...rest,
    };

    return (
      <div className={wrapperClasses}>
        <div className="md3-textfield__field">
          {leadingIcon && (
            <span className="material-symbols-outlined md3-textfield__leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              {...(sharedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...(sharedProps as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {trailingIcon && (
            <span className="material-symbols-outlined md3-textfield__trailing" aria-hidden="true">
              {trailingIcon}
            </span>
          )}

          <label htmlFor={fieldId} className="md3-textfield__label">
            {label}
          </label>
        </div>

        {(supportingText || errorText) && (
          <p className={`md3-textfield__supporting ${hasError ? 'is-error' : ''}`}>
            {hasError ? errorText : supportingText}
          </p>
        )}
      </div>
    );
  },
);

export default TextField;
