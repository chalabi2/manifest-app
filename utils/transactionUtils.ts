import { useState } from 'react';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@chalabi/manifestjs';
import { useChain } from '@cosmos-kit/react';

export const useSimulateDenomCreation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { tx } = useTx('manifest');
  const { address } = useChain('manifest');

  const simulateDenomCreation = async (subdenom: string): Promise<boolean> => {
    if (!address) {
      console.log('Simulation failed: No address available');
      return false;
    }

    setIsSimulating(true);
    const { createDenom } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

    const msg = createDenom({
      sender: address,
      subdenom: subdenom,
    });

    try {
      console.log(`Simulating denom creation for subdenom: ${subdenom}`);
      const result = await tx([msg], { simulate: true, returnError: true });

      if (result === undefined) {
        console.log('Simulation result is undefined');
        return false;
      }

      if ('error' in result) {
        console.error('Simulation error:', result.error);
        return false;
      }

      console.log('Simulation successful');
      return true;
    } catch (error) {
      console.error('Unexpected error during simulation:', error);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  return { simulateDenomCreation, isSimulating };
};
