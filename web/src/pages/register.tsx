import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import InputField from '../UI/InputField';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

type РegisterProps = {};

const Рegister = ({}: РegisterProps) => {
  const [{}, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Рegister;
