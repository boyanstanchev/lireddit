import { NextPage } from 'next';

const ChangePassword: NextPage<{ token: string }> = () => {
  return <div></div>;
};

ChangePassword.getInitialProps = ({ query }) => ({
  token: query.token as string,
});

export default ChangePassword;
