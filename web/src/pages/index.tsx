import NavBar from '@components/NavBar';
import { createUrqlClient } from '@utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar />
      <br />
      {!data
        ? null
        : data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
