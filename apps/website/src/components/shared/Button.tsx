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
        'p-2 rounded-lg bg-transparent border border-cyan-800 border-solid hover:bg-gray-900  transition-all duration-300 text-cyan-700 z-10',
        props.class,
      )}
    >
      <Slot />
    </button>
  );
});
