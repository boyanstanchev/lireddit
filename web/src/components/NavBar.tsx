import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

const NavBar = () => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  const [{ fetching: logoutFething }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>

        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={3}>{data.me.username}</Box>
        <Button
          isLoading={logoutFething}
          variant="link"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex p={4} ml={'auto'} bg="tomato">
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
