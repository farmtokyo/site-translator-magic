import SitePage from "@/components/SitePage";

const Blog = () => (
  <SitePage
    htmlPath="pages/blog.html"
    extraScripts={["/js/blog.js"]}
    title="Блог — MollAI"
  />
);

export default Blog;
