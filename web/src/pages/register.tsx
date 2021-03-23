import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import { useMutation } from 'urql';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import InputField from '../UI/InputField';

type РegisterProps = {};

const Рegister = ({}: РegisterProps) => {
  const [{}, register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        onSubmit={async (values) => {
          const response = await register(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />

            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>

            <Button
              mt={4}
              isLoading={isSubmitting}
              colorScheme="teal"
              type="submit"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Рegister;
