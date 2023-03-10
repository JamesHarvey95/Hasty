import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '@fullcalendar/core';
import { useNavigate } from 'react-router-dom';
import hasty from '../../assets/images/hastylogo.png';

function Blog({ currentUser, blog: aBlog, onDeleteClicked }) {
  const stateForDisplay = { type: 'BLOG_DISPLAY', payload: aBlog };
  const navigate = useNavigate();

  const onEditClicked = (event) => {
    event.preventDefault();
    navigate(`/blogs/${aBlog.id}/edit`, { state: stateForDisplay });
  };

  const onDelete = (event) => {
    event.preventDefault();
    onDeleteClicked(aBlog, event);
  };

  let date = formatDate(aBlog.datePublished, {
    month: 'numeric',
    year: 'numeric',
    day: 'numeric',
  });

  const onViewClicked = (event) => {
    event.preventDefault();

    navigate(`/blogs/${aBlog.id}/details`, { state: stateForDisplay });
  };

  return (
    <div className="col-md-3">
      <div className="card border card-height" id={aBlog.id}>
        <img src={aBlog.imageUrl} className="card-img-top image-height" alt="I Love Code" />
        <div className="card-body">
          <h5 className="card-title">{aBlog.title}</h5>
          <p className="card-text">
            {aBlog.author.firstName} {aBlog.author.mi} {aBlog.author.lastName}
          </p>
          <p className="card-text">{aBlog.blogType.name}</p>
          <p className="card-text">{date}</p>
          <button type="submit" className=" btn btn-secondary mx-1" onClick={onViewClicked}>
            View
          </button>
          {(currentUser.id === 71 || currentUser.id === aBlog.author.id) && (
            <button type="submit" className="btn btn-secondary mx-1" onClick={onEditClicked}>
              Edit
            </button>
          )}
          {(currentUser.id === 71 || currentUser.id === aBlog.author.id) && (
            <button type="submit" className="btn btn-secondary mt-2 mx-1" onClick={onDelete}>
              Delete
            </button>
          )}
          {(currentUser.id === 71 || currentUser.id === aBlog.author.id) && aBlog.isPublished && (
            <img className="h-25 w-25 mt-1" src={hasty} alt="isPublished logo" />
          )}
        </div>
      </div>
    </div>
  );
}

Blog.propTypes = {
  blog: PropTypes.shape({
    imageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    author: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      mi: PropTypes.string,
      lastName: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    }).isRequired,
    subject: PropTypes.string,
    datePublished: PropTypes.string,
    id: PropTypes.number.isRequired,
    isPublished: PropTypes.bool.isRequired,
    blogType: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    blogStatus: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onDeleteClicked: PropTypes.func,
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    isLoggedIn: PropTypes.bool,
  }),
};

export default Blog;
