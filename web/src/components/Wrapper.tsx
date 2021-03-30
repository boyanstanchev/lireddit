import { Box } from '@chakra-ui/layout';
import { PropsWithChildren } from 'react';

type WrapperProps = PropsWithChildren<{
  variant?: 'small' | 'regular';
}>;

const Wrapper = ({ children, variant = 'regular' }: WrapperProps) => {
  return (
    <Box
      maxWidth={variant === 'regular' ? '800px' : '400px'}
      w="100%"
      mt="8"
      mx="auto"
    >
      {children}{' '}
    </Box>
  );
};

export default Wrapper;
