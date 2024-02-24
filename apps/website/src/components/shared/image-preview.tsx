import { $, component$, useSignal } from '@builder.io/qwik';
import { AnimatePresence, motion } from 'framer-motion';

export type ImagePreviewProps = {
  images: string[];
};

export const ImagePreview = component$<ImagePreviewProps>((props) => {
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const imageIndex = useSignal(0);
  const direction = useSignal(0);

  const paginate = $((index: number) => {
    console.log('paginate', index);
  });

  return (
    <>
      <AnimatePresence initial={false} custom={direction.value}>
        <motion.img
          key={0}
          src={props.images[imageIndex.value]}
          custom={direction.value}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            console.log(e, offset, velocity);
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        />
      </AnimatePresence>
    </>
  );
});
