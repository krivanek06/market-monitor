/**
 *
 * Example usage (in spec file):
 * import fftest from "firebase-functions-test";
 * const fft = fftest(*firebase config here*);
 * const wrappedFunction = fft.wrap<
 *   CallableV2Request<CallableFunctionDataInterface>
 * >(actualFunction as any);
 *
 * ref: https://github.com/firebase/firebase-functions-test/issues/163
 * */
import firebaseFunctionsTest from 'firebase-functions-test';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { onCall } from 'firebase-functions/v2/https';

type V2CallableReturn<T> = ReturnType<typeof onCall<T>>;

type WrapV2Function = <T>(cloudFunction: V2CallableReturn<T>) => ReturnType<FeaturesList['wrap']>;

export type WrapV2Features = Omit<FeaturesList, 'wrap'> & {
  wrapV2: WrapV2Function;
};

export function _initializeFunctionsTest(): WrapV2Features {
  const { wrap, ...features } = firebaseFunctionsTest();
  // <your config here>

  function wrapV2<T>(cloudFunction: V2CallableReturn<T>) {
    return wrap(cloudFunction as any);
  }

  return {
    ...features,
    wrapV2,
  };
}

export interface CallableV2Request<T = any> {
  data: T;
  auth?: {
    uid: string;
  };
}
