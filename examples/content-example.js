<figure>
  <img alt="A staggered waterfall graph of the loading of a code-split React app." src="https://cdn-images-1.medium.com/max/986/1*ZpeXvOETtbiSxzW3g4BrYw.png" />
  <figcaption>A staggered waterfall graph of the downloading of a code-split React app.</figcaption>
</figure>
<p>
  I’ve recently been building a client-side router for <a href="https://www.yld.io/speciality/react-js/">React</a> that also abstracts the <a href="https://reactjs.org/docs/code-splitting.html#suspense">Suspense API</a>; that is, the router will provide particular components for the current path (i.e. window.location.pathname), but will also support Suspenseful components out-of-the-box. Unfortunately, it turns out that such an abstraction is not ideal due to its inflexibility, but I would nonetheless like to demonstrate how one can defer the loading of React components using this new feature.
</p>
<h3>The App</h3>
<figure>
  <img alt="A React app for rendering various Lorem Ipsums." src="https://cdn-images-1.medium.com/max/852/1*A2iTe7siTJ6W8vbWCilREw.gif" />
</figure>
<p>
  Ipsum.io is a React app that renders variations of the <a href="https://en.wikipedia.org/wiki/Lorem_ipsum">Lorem Ipsum</a> placeholder text commonly used in design and publishing. Each “page” is a React component:
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/26784fc453f1977d5acd15f357cc46e9/href">https://medium.com/media/26784fc453f1977d5acd15f357cc46e9/href</a>
</iframe>
<p>
  These page components are mapped to particular paths via a <a href="https://github.com/jamesseanwright/react-lazy-routes/blob/7f4d8a8af0574f4af6881129fc0dffb91945c9c4/src/routing.tsx#L75">Router</a> component, which provides its consumer with the page for the current path, accessible via a child <a href="https://reactjs.org/docs/render-props.html">render prop</a>:
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no"><a href="https://medium.com/media/0a8c85e8c2c9b25b297090a90bdb363e/href">https://medium.com/media/0a8c85e8c2c9b25b297090a90bdb363e/href</a></iframe>
<p>
  For example: if the current path is &#39;/office&#39;, then the Page parameter passed to the child render prop will be pages.Office. If said path has no associated component, then the element passed via the notFound prop will be rendered.
</p>
<p>
  The user can navigate between routes using the Link component; this renders a regular anchor element (i.e. &lt;a /&gt;), but also updates the Router‘s current page; it’s analogous to the <a href="https://github.com/ReactTraining/react-router/blob/7ccbd7eb7ca603ba164ad75181a48038dd5f4321/packages/react-router-dom/docs/api/Link.md">Link component provided by React Router</a>:
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no"><a href="https://medium.com/media/a229a0c7bb7dc8a6c8d330853d1d3c41/href">https://medium.com/media/a229a0c7bb7dc8a6c8d330853d1d3c41/href</a></iframe>
<p>
  Note that I won’t be covering my router implementation in this article. It’s your standard <a href="https://reactjs.org/docs/context.html">Context</a> and <a href="https://reactjs.org/docs/hooks-state.html">setState</a> affair, which is already covered by many <a href="https://tylermcginnis.com/build-your-own-react-router-v4/">excellent</a> <a href="https://medium.com/@stevenkoch/how-to-build-your-own-react-router-with-new-react-context-api-1647406b9b93">resources</a>. However, you are more than welcome to peruse <a href="https://github.com/jamesseanwright/react-lazy-routes/blob/7f4d8a8af0574f4af6881129fc0dffb91945c9c4/src/routing.tsx">my approach</a> over at the <a href="https://github.com/jamesseanwright/react-lazy-routes">GitHub repository</a>.
</p>
<h3>The Problem</h3>
<figure>
  <img alt="Without lazy components, we’re producing a single, larger bundle of content that may never be used." src="https://cdn-images-1.medium.com/max/900/1*3_GukAU3yO2rMpurBgC7nA.gif" />
</figure>
<p>
  With this unified bundle, we’re forcing the client to download content that may never be rendered. Being able to defer the downloading of these various lipsums until the user navigates to their associated route would reduce initial JavaScript parse times and thus the time it takes for the app <a href="https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive">to become interactive</a>. What if we could therefore split our app into respective chunks for each path?
</p>
<figure>
  <img alt="With dynamic imports and React.lazy, we can defer the loading of additional content until it’s needed." src="https://cdn-images-1.medium.com/max/640/1*QCtUUBbSOdz4Lksb2_FkVg.gif" />
</figure>
<p>Code splitting in this fashion is nothing new; <a href="https://webpack.js.org/guides/code-splitting/#dynamic-imports">Webpack</a> and <a href="https://rollupjs.org/guide/en/">Rollup</a> have provided this out of the box for a while, and there are already various <a href="https://tylermcginnis.com/react-router-code-splitting/">component-based strategies for consuming these bundles with React</a>. However, React now provides first-class primitives to defer the loading of components until they’re absolutely needed.</p>
<h3>What is Suspense?</h3>
<p>
  Given the context of this article, it may be tempting to view <a href="https://reactjs.org/docs/code-splitting.html#suspense">Suspense</a> as a lazy loading mechanism, but this is inaccurate. Rather, it provides a means of… well… <em>suspending</em> the rendering of an element subtree until a particular operation completes, allowing React to render other parts of your app in the meantime; a fallback will be shown until said operation is fulfilled.
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/350e0be82339b50feca0896095569d1f/href">https://medium.com/media/350e0be82339b50feca0896095569d1f/href</a>
</iframe>
<p>
  In this example, whenever SomeSuspensefulComponent is suspended, the fallback <em>node </em>(this prop supports both React elements and JavaScript primitives such as strings) is rendered within that Suspense <a href="https://twitter.com/dan_abramov/status/1150842009403482113"><em>boundary</em></a> (i.e. &lt;React.Suspense /&gt;).
</p>
<p>It’s even possible to nest Suspense boundaries:</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/e8da94d7121788cd8c1c01d2276bc860/href">https://medium.com/media/e8da94d7121788cd8c1c01d2276bc860/href</a>
</iframe>
<p>With Suspense, we can declaratively determine <em>what </em>to show in lieu of a particular component when it needs to be deferred.</p>
<h3><em>How</em> can we Suspend Rendering?</h3>
<p>
  It’s all well and good discussing the concept, but <em>how</em> can we trigger this? Looking into the implementation (as of July 2019) of one of the first-party components that supports Suspense is extremely telling:
  </p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/f6a91a3df9b9a13a6cb52d8847780520/href">https://medium.com/media/f6a91a3df9b9a13a6cb52d8847780520/href</a>
</iframe>
<p>
  Much like an <a href="https://reactjs.org/docs/error-boundaries.html">error boundary</a> catching an error, Suspense will catch the Promise (thenable) thrown in the pending state and render the fallback until it’s resolved; React handles this by unwinding its internal render stack to the nearest Suspense boundary and then continuing to render the subsequent elements in the tree. Charles Stover’s <a href="https://github.com/CharlesStover/fetch-suspense">fetch-suspense</a> Hook <a href="https://github.com/CharlesStover/fetch-suspense/blob/master/src/fetch-suspense.ts#L63">throws a </a><a href="https://github.com/CharlesStover/fetch-suspense/blob/master/src/fetch-suspense.ts#L63">Promise returned by the fetch API in the same way</a> to inform Suspense that it should render the fallback.
</p>
<h3>Lazy Loading Components with React.lazy</h3>
<p>
  As of the original publication date of this article (July 2019), there is actually only a single component provided by the React team that supports Suspense: <a href="https://reactjs.org/docs/code-splitting.html#reactlazy">React.lazy</a>.
</p>
<p>React.lazy takes a function that returns a Promise, which should resolve with a React component. Prior to resolving or rejecting, Suspense can tap into this Promise as demonstrated above to render a fallback:
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/c36e7556f9dfc4e45d717d31f6c0b4c0/href">https://medium.com/media/c36e7556f9dfc4e45d717d31f6c0b4c0/href</a>
</iframe>
<p>
  Given that <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports">dynamic imports</a> return Promises, we can take advantage of the aforementioned, configuration-free code splitting provided by the likes of Webpack and Rollup <em>and</em> load these respective ES Module-compliant bundles only when required.</p><p>Following this approach, we can update Ipsum.io to take advantage of lazy routing:
</p>
<iframe src="" width="0" height="0" frameborder="0" scrolling="no">
  <a href="https://medium.com/media/7a96d8843bd0791e86c755e657fe18d2/href">https://medium.com/media/7a96d8843bd0791e86c755e657fe18d2/href</a>
</iframe>
<p>Notice how we can also render non-Suspenseful components (the initial page rendered via the / path) within a Suspense boundary.</p>
<p>
  As a result of lazy loading, we’re able to reduce the initial bundle size, avoiding the downloading of unused bytes and reducing our <a href="https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive">initial time to interactive</a>.
</p>
<figure>
  <img alt="With dynamic imports and React.lazy, we can defer the loading of additional content until it’s needed." src="https://cdn-images-1.medium.com/max/640/1*QCtUUBbSOdz4Lksb2_FkVg.gif" />
</figure>
<p>Given the simplicity of the app, I’ve opted to exclude any metrics, but I hope that you can see the potential benefits this will introduce to much larger and feature-rich single-page apps.</p>
<h3>Summary</h3>
<p>
  Suspending the rendering of various React subtrees is a big win for building slick user experiences, allowing the rest of the parent tree to be processed until certain prerequisite tasks are fulfilled. As Suspense rises in popularity, I’m certain we’ll witness all sorts of exciting and pragmatic usages of this feature, but for now, first-class lazy loading is a strong start.
</p>
<img src="https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=33e0ea3389b6" width="1" height="1">
  <hr>
    <p>
      <a href="https://medium.com/yld-blog/saving-bytes-in-react-apps-with-suspense-and-lazy-components-33e0ea3389b6">Saving Bytes in React Apps with Suspense and Lazy Components</a> was originally published in <a href="https://medium.com/yld-blog">YLD Blog</a> on Medium, where people are continuing the conversation by highlighting and responding to this story.
    </p>