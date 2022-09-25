import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from "@prismicio/client"
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { FormatDate } from '../../utils/dateFormat';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  console.log(router.isFallback)
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const totalWordsOfBody = RichText.asText(
    post.data.content.reduce(
      (accumulator, currentValue, index, array) => [...accumulator, ...currentValue.body], [])
  ).split(' ').length

  const totalWordsOfHeading = post.data.content.reduce((accumulator, currentValue) => {
    if (currentValue.heading) {
      return [...accumulator, ...currentValue.heading.split(' ')];
    }

    return [...accumulator];
  }, []).length

  const readingTime = Math.ceil(
    (totalWordsOfBody + totalWordsOfHeading) / 200
  );

  return (
    <>
      <Head>
        <title>Spacetraveling | Post</title>
      </Head>
      <section className={styles.banner}>
        <img src={post.data.banner.url} alt="logo" />
      </section>
      <main className={commonStyles.content}>
        <article className={styles.post}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <span>
              <FiCalendar size={16} />
              <time>{FormatDate({
                date: post.first_publication_date,
                formatDate: 'dd MMM yyyy'
              })}</time>
            </span>
            <span>
              <FiUser size={16} />
              <span>{post.data.author}</span>
            </span>
            <span>
              <FiClock size={16} />
              <span>{readingTime} min</span>
            </span>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <section key={heading}>
                {heading && <h2>{heading}</h2>}
                <div className={styles.postData} dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
              </section>
            ))}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 3,
  });

  const paths = posts.results.map((post) => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  }
};
