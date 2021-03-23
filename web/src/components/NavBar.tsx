import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';

type NavBarProps = {};

const NavBar = ({}: NavBarProps) => {
  const [{ data, fetching }] = useMeQuery();

  console.log(data);
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
        <Button variant="link" onClick={() => null}>
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
