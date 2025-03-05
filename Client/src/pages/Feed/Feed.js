import React, { Component, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";
// import { graphql } from "graphql";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    const graphqlQuery = {
      query: `
        {
          user {
            status
          }
        }
      `
    }
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error('Fetching status failed!');
        }
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }
    const graphqlQuery = {
      query: `
        {
          posts(page: ${page}) {
            posts {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
            totalPosts
          }
        }
      `,
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching Posts failed!");
        }
        // Replace backslashes with forward slashes in imageUrl
        const formattedPosts = resData.data.posts.posts.map((post) => ({
          ...post,
          creator: post.creator.name,
          createdAt: post.createdAt,
          imageUrl: post.imageUrl.replace(/\\/g, "/"), // Key Line: Replace backslashes
        }));

        this.setState({
          posts: formattedPosts,
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        mutation {
          updatestatus(status: "${this.state.status}"){
            status
          }
        }
      `
    }
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching Status failed!");
        }
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };
      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = async (postData) => {
    this.setState({ editLoading: true });

    const isUpdate = !!this.state.editPost;

    const formData = new FormData();
    if (postData.image && postData.image instanceof File) {
      formData.append("image", postData.image);
    }

    if (isUpdate) {
      formData.append("oldPath", this.state.editPost.imageUrl);
    }

    try {
      // Upload image to server
      const fileRes = await fetch("http://localhost:8080/post-image", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
        body: formData,
      });
      const fileResData = await fileRes.json();

      let imageUrl = isUpdate ? this.state.editPost.imageUrl : "";
      if (fileResData.filePath) {
        imageUrl = fileResData.filePath;
      }

      // Construct GraphQL mutation using variables with correct argument names
      const graphqlQuery = isUpdate
        ? {
            query: `
              mutation UpdatePost($id: ID!, $postInput: PostInputData) {
                updatePost(id: $id, postInput: $postInput) {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                    name
                  }
                  createdAt
                }
              }
            `,
            variables: {
              id: this.state.editPost._id,
              postInput: {
                title: postData.title,
                content: postData.content,
                imageUrl,
              },
            },
          }
        : {
            query: `
              mutation CreatePost($postInput: PostInputData) {
                createPost(postInput: $postInput) {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                    name
                  }
                  createdAt
                }
              }
            `,
            variables: {
              postInput: {
                title: postData.title,
                content: postData.content,
                imageUrl,
              },
            },
          };

      // Execute GraphQL mutation
      const res = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });

      const resData = await res.json();

      if (resData.errors) {
        const errorMessage =
          resData.errors[0].message || "Failed to update post.";
        throw new Error(errorMessage);
      }

      // Extract updated or created post from response
      const post = isUpdate ? resData.data.updatePost : resData.data.createPost;

      this.setState(
        (prevState) => ({
          ...prevState,
          posts: isUpdate
            ? prevState.posts.map((p) => (p._id === post._id ? post : p))
            : [post, ...prevState.posts],
          isEditing: false,
          editPost: null,
          editLoading: false,
        }),
        () => this.loadPosts() // Refresh posts to ensure consistency
      );
    } catch (error) {
      console.error("Error creating/updating post:", error);
      this.setState({
        isEditing: false,
        editPost: null,
        editLoading: false,
        error: error.message,
      });
    }
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    const graphqlQuery = {
      query: `
            mutation DeletePost($id: ID!) {
                deletePost(id: $id)
            }
        `,
      variables: {
        id: postId,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors) {
          throw new Error(resData.errors[0].message);
        }
        if (!resData.data.deletePost) {
          throw new Error("Post deletion not confirmed by the server");
        }
        console.log("Post deleted successfully");
        this.loadPosts();
      })
      .catch((err) => {
        console.error("Error deleting post:", err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={`http://localhost:8080/${post.imageUrl}`}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
