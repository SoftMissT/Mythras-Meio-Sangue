import type ApplicationV2 from "./application.ts";

/** Button configuration for a DialogV2 instance. */
export interface DialogV2Button {
  /** Button action identifier; required. */
  action: string;
  /** Button label text. */
  label?: string;
  /** Font Awesome icon class displayed before the label. */
  icon?: string;
  /** Is this the default button activated on Enter keypress? */
  default?: boolean;
  /** Callback invoked when the button is clicked. Its return becomes the dialog result. */
  callback?: (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: DialogV2
  ) => unknown;
}

export interface DialogV2Configuration extends ApplicationConfiguration {
  /** Content rendered within the dialog body. */
  content?: string | HTMLDivElement;
  /** Buttons rendered within the dialog footer. */
  buttons: DialogV2Button[];
  /** Is this a modal dialog? */
  modal?: boolean;
  /** Reject the returned Promise when the dialog is dismissed? */
  rejectClose?: boolean;
  /** Callback invoked with the dialog result on submit. */
  submit?: (result: unknown) => unknown;
}

export default class DialogV2 extends ApplicationV2<DialogV2Configuration> {
  constructor(options?: Partial<DialogV2Configuration>);

  static confirm(config?: Partial<DialogV2Configuration>): Promise<boolean>;
  static prompt(config?: Partial<DialogV2Configuration>): Promise<unknown>;
  static wait(config?: Partial<DialogV2Configuration>): Promise<unknown>;
}
