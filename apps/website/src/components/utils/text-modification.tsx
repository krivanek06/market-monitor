import { $, component$, useSignal } from '@builder.io/qwik';

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export type TextModifactorProps = {
  name: string;
};

export const TextModifactor = component$<TextModifactorProps>(({ name }) => {
  // always changing value
  const displayName = useSignal(name);
  // transforms name to masked text - XXXX
  const defaultMaskedText = useSignal(
    name
      .split('')
      .map((d) => (d === ' ' ? ' ' : 'X'))
      .join(''),
  );

  const interval = useSignal<any>(null);

  const stopRandomTextGenerationLoop = $(() => {
    if (interval.value) {
      clearInterval(interval.value);
    }
  });

  const startRandomTextGenerationLoop = $(() => {
    stopRandomTextGenerationLoop();

    interval.value = setInterval(() => {
      const newMastedText = displayName.value
        .split('')
        .map((_, index) => {
          return LETTERS[Math.floor(Math.random() * 26)];
        })
        .join('');

      // change input
      displayName.value = newMastedText;
    }, 30);
  });

  const generateText = $((inputText: string, alreadyDisplayedWork?: string): Promise<void> => {
    // const indexes = Array.from(Array(inputText.length).keys())
    // const shuffledIndexes = getShuffledArr(indexes)
    let iteration = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const newTex = inputText
          .split('')
          .map((_, index) => {
            // desired letter at shuffled index
            if (index < iteration) {
              return inputText[index];
            }

            // if I no longer want to change chars
            if (alreadyDisplayedWork) {
              return alreadyDisplayedWork[index];
            }

            // random letter
            return LETTERS[Math.floor(Math.random() * 26)];
          })
          .join('');

        // change input
        displayName.value = newTex;

        if (iteration >= inputText.length) {
          clearInterval(interval);
          resolve();
        }

        // no recursion - go fast
        iteration += alreadyDisplayedWork ? 1 : 1 / 3;
      }, 60);
    });
  });

  const generateBackToOriginal = $(async () => {
    await generateText(defaultMaskedText.value, displayName.value);
    await generateText(name, defaultMaskedText.value);
  });

  const initAnimation = $(() => {
    startRandomTextGenerationLoop();

    setTimeout(() => {
      generateBackToOriginal();
      stopRandomTextGenerationLoop();
    }, 500);
  });

  return <span onMouseEnter$={() => initAnimation()}>{displayName}</span>;
});
