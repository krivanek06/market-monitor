import { Slot, component$ } from '@builder.io/qwik';
import { twMerge } from 'tailwind-merge';

export type CardBasicProps = {
  class?: string;
};

export const CardBasic = component$<CardBasicProps>((props) => {
  return (
    <div
      class={twMerge('px-4 py-2 border border-cyan-800 border-solid bg-gray-900 rounded-lg bg-opacity-60', props.class)}
    >
      <Slot />
    </div>
  );
});
