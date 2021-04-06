import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import { useLoginMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import Wrapper from '@components/Wrapper';
import InputField from '@UI/InputField';
import { createUrqlClient } from '@utils/createUrqlClient';
import { toErrorMap } from '@utils/toErrorMap';
import NextLink from 'next/link';

type LoginProps = {};

const Login = ({}: LoginProps) => {
  const [{}, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          usernameOrEmail: '',
          password: '',
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="Username Or Email"
              label="Username Or Email"
            />

            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>

            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link ml="auto">Forgot Password</Link>
              </NextLink>
            </Flex>

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

export default withUrqlClient(createUrqlClient)(Login);
