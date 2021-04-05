import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import InputField from '../../UI/InputField';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          newPassword: '',
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token,
            newPassword: values.newPassword,
          });

          if (response.data?.changePassword.errors) {
            setErrors(toErrorMap(response.data.changePassword.errors));
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />

            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => ({
  token: query.token as string,
});

export default ChangePassword;
