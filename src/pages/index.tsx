import { useEffect, useState } from 'react'
import { GetStaticProps } from 'next';
import Head from "next/head";
import Link from "next/link";

import Prismic from "@prismicio/client";
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from "react-icons/fi";
import { FormatDate } from '../utils/dateFormat';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [nextPage, setNextPage] = useState('')

  useEffect(() => {
    setPosts(postsPagination.results)
    setNextPage(postsPagination.next_page)
  }, [postsPagination.results, postsPagination.next_page])

  const loadMorePosts = async (): Promise<void> => {
    await fetch(nextPage)
      .then((response) => response.json())
      .then((data: PostPagination) => {
        const dataFormatted = data.results.map((post: Post) => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author
            }
          }
        })
        setPosts([...posts, ...dataFormatted])
        setNextPage(data.next_page)
      })
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <main className={commonStyles.content}>
        <div className={styles.post}>
          {posts.map((post) => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <span>
                    <FiCalendar size={16} />
                    <time>{FormatDate({ date: post.first_publication_date, formatDate: 'dd MMM yyyy' })}</time>
                  </span>
                  <span>
                    <FiUser size={16} />
                    <span>{post.data.author}</span>
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <div className={styles.action}>
            <button onClick={loadMorePosts}>Carregar mais posts</button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.first_publication_date', 'posts.author'],
    pageSize: 3,
  });

  const { next_page, results } = postsResponse

  return {
    props: {
      postsPagination: {
        results,
        next_page
      }
    }
  }
};
