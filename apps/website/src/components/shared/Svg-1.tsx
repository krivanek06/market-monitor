import { component$ } from '@builder.io/qwik';

export type SVG1Props = {
  class?: string;
};

export const SVG1 = component$<SVG1Props>((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      fill="none"
      viewBox="0 0 200 200"
      version="1.1"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class={props.class}
    >
      <path
        fill='url("#SvgjsLinearGradient2070")'
        d="M165.963 134.037c-5.467 5.467-14.332 5.467-19.799 0l-24.137-24.138c-5.468-5.467-5.468-14.331 0-19.799l24.137-24.137c5.467-5.467 14.332-5.467 19.799 0L190.101 90.1c5.467 5.468 5.467 14.332 0 19.799l-24.138 24.138Zm-112.127 0c-5.467 5.467-14.332 5.467-19.8 0L9.9 109.899c-5.468-5.467-5.468-14.331 0-19.799l24.137-24.137c5.467-5.467 14.332-5.467 19.799 0L77.973 90.1c5.468 5.468 5.468 14.332 0 19.799l-24.137 24.138ZM109.9 190.1c-5.468 5.468-14.332 5.468-19.8 0l-24.137-24.137c-5.467-5.467-5.467-14.332 0-19.799l24.138-24.137c5.467-5.468 14.331-5.468 19.799 0l24.137 24.137c5.467 5.467 5.467 14.332 0 19.799L109.9 190.1Zm0-112.127c-5.468 5.468-14.332 5.468-19.8 0L65.963 53.836c-5.467-5.468-5.467-14.332 0-19.8L90.101 9.9c5.467-5.467 14.331-5.467 19.799 0l24.137 24.138c5.467 5.467 5.467 14.331 0 19.799L109.9 77.973Z"
      ></path>
      <defs>
        <linearGradient gradientTransform="rotate(0 0.5 0.5)" id="SvgjsLinearGradient2070">
          <stop stop-opacity=" 1" stop-color="rgba(172, 2, 20)" offset="0"></stop>
          <stop stop-opacity=" 1" stop-color="rgba(75, 2, 9)" offset="0.48"></stop>
          <stop stop-opacity=" 1" stop-color="rgba(255, 7, 33)" offset="1"></stop>
          <stop stop-opacity=" 1" stop-color="rgba(255, 7, 33)" offset="1"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
});
