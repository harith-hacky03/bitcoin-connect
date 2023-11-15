import {html} from 'lit';
import {classes} from '../css/classes';

export function hr(text?: string) {
  const hrClasses = `border-t ${
    classes['border-neutral-tertiary']
  } opacity-20 ${text ? 'w-24' : 'w-full'}`;

  return html`<div class="w-full px-8 flex gap-2 justify-center items-center">
    <hr class=${hrClasses} />
    ${text
      ? html`
          <span class=${classes['text-neutral-tertiary']}>${text}</span>
          <hr class=${hrClasses} />
        `
      : null}
  </div>`;
}
