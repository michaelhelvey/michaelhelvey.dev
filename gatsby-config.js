module.exports = {
  siteMetadata: {
    title: `michaelhelvey.dev`,
    author: `Michael Helvey`,
    description: `I love to learn, read, and create tools that allow me and others to
    build good things. I write about what I learn. I’m passionate about
    building systems that make the internet a better place for humans.`,
    siteUrl: `https://michaelhelvey.dev`,
    image: '/assets/profile-pic.jpg',
    social: {
      twitter: `helvetici`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `michaelhelvey.dev`,
        short_name: `michaelhelvey.dev`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#38a169`,
        display: `minimal-ui`,
        icon: `content/assets/gopher.jpg`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-postcss`,
  ],
}
