import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {BitcoinConnectElement} from './BitcoinConnectElement';
import './bc-router-outlet.js';
import './internal/bci-connecting';
import store from '../state/store';
import {dispatchEvent} from '../utils/dispatchEvent';
import {withTwind} from './twind/withTwind';
import './bc-modal-header';
import {classes} from './css/classes';

/**
 * The modal allows the user to view a list of connectors, connect and disconnect.
 */
@customElement('bc-modal')
export class Modal extends withTwind()(BitcoinConnectElement) {
  /**
   * Called when modal is closed
   */
  @property({
    attribute: 'on-close',
  })
  onClose?: () => void;

  @state()
  protected _closing = false;

  @property({
    type: Boolean,
  })
  open?: boolean = false;

  @property({
    type: String,
    attribute: 'invoice',
  })
  invoice?: string;

  _prevOpen?: boolean = false;
  _prevConnected?: boolean = false;

  constructor() {
    super();

    // TODO: handle unsubscribe
    store.subscribe((currentStore, prevStore) => {
      if (
        currentStore.connected !== prevStore.connected &&
        !currentStore.connected
      ) {
        this._handleClose();
      }
      if (
        currentStore.connected !== prevStore.connected &&
        currentStore.connected &&
        currentStore.invoice
      ) {
        store.getState().setRoute('/send-payment');
      }
    });
  }

  override render() {
    // fetch balance and info if modal is opened or connector is initialized while the model is open
    if (
      (this._prevConnected !== this._connected ||
        this._prevOpen !== this.open) &&
      this._connected &&
      this.open
    ) {
      store.getState().fetchConnectorInfo();
    }
    if (this._prevConnected !== this._connected) {
      this._prevConnected = this._connected;
    }
    if (this._prevOpen !== this.open) {
      this._prevOpen = this.open;
      if (this.open) {
        dispatchEvent('bc:modalopened');
        if (this.invoice != undefined) {
          store.getState().setInvoice(this.invoice);
          store.getState().setRoute('/send-payment');
        }
      } else {
        dispatchEvent('bc:modalclosed');
      }
    }

    if (!this.open) {
      return null;
    }

    return html` <div
      class="fixed top-0 left-0 w-full h-full flex justify-center items-end sm:items-center z-[21000]"
    >
      <div
        class="absolute top-0 left-0 w-full h-full ${classes[
          'bg-foreground'
        ]} ${this._closing ? 'animate-lighten' : 'animate-darken'}"
      ></div>
      <div
        class="transition-all p-4 pt-6 pb-8 rounded-3xl shadow-2xl flex flex-col justify-center items-center w-full bg-white dark:bg-black max-w-md max-sm:rounded-b-none
    ${this._closing ? 'animate-fade-out' : 'animate-fade-in'}"
      >
        <bc-modal-header
          class="flex w-full"
          .onClose=${this._handleClose}
        ></bc-modal-header>
        <div class="flex w-full pt-8">
          ${this._connecting
            ? html`<bci-connecting class="flex w-full"></bci-connecting>`
            : html` <bc-router-outlet class="flex w-full"></bc-router-outlet>`}
        </div>
        ${this._error
          ? html`<p class="mt-4 text-red-500">${this._error}</p>`
          : null}
      </div>
    </div>`;
  }

  private _handleClose = () => {
    this._closing = true;
    setTimeout(() => {
      this.open = false;
      this._closing = false;
      // Reset after close
      // TODO: is there a better way to reset state when the modal is closed?
      store.getState().setRoute('/start');
      store.getState().setError(undefined);
      this.onClose?.();
    }, 200);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'bc-modal': Modal;
  }
}
