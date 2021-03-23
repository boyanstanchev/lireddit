import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import InputField from '../UI/InputField';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

type LoginProps = {};

const Login = ({}: LoginProps) => {
  const [{}, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ input: values });

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data?.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
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
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;