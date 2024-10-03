import { QRL, Slot, component$ } from '@builder.io/qwik';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = {
  onClick$: QRL<() => void>;
  class?: string;
};

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      type="button"
      onClick$={props.onClick$}
      class={twMerge(
        'z-10 rounded-lg border border-solid border-cyan-700 bg-transparent p-2 text-cyan-700 transition-all duration-300 hover:bg-cyan-900',
        props.class,
      )}
    >
      <Slot />
    </button>
  );
});
