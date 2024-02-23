import { QRL, component$ } from '@builder.io/qwik';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = {
  label: string;
  onClick$: QRL<() => void>;
  class?: string;
};

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      type="button"
      onClick$={props.onClick$}
      class={twMerge(
        'p-2 rounded-lg bg-transparent border border-cyan-700 border-solid hover:bg-cyan-950 transition-all duration-300 text-cyan-700 z-10',
        props.class,
      )}
    >
      {props.label}
    </button>
  );
});
