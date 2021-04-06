import { Box, Button } from '@chakra-ui/react';
import Wrapper from '@components/Wrapper';
import InputField from '@UI/InputField';
import { createUrqlClient } from '@utils/createUrqlClient';
import { Formik, Form } from 'formik';
import { useForgotPasswordMutation } from 'generated/graphql';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';

type ForgotPasswordProps = {};

const ForgotPassword = ({}: ForgotPasswordProps) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={async (values) => {
          await forgotPassword(values);

          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we've send you an email
            </Box>
          ) : (
            <Form>
              <InputField
                name="emal"
                placeholder="Email"
                label="Email"
                type="email"
              />

              <Button
                mt={4}
                isLoading={isSubmitting}
                colorScheme="teal"
                type="submit"
              >
                Forgot Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
