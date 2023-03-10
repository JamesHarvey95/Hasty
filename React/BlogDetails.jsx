import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../../utils/dateFormater';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../elements/Header';
import { Link } from 'react-router-dom';
import Comments from '../comments/Comments';
import commentService from '../../services/commentService'
import PropTypes from 'prop-types'


function BlogDetails(props) {
    const [pageData, setPageData] = useState({
        author: { id: 0, firstName: '', lastName: '', mi: '', avatarUrl: '' },
        blogStatus: { id: 0, name: '' },
        blogType: { id: 0, name: '' },
        content: '',
        dateCreated: '',
        dateModified: '',
        datePublished: '',
        imageUrl: '',
        isPublished: false,
        subject: '',
        title: '',
    });

    const { id } = useParams();
    const { state } = useLocation();
    const crumbs = [{ name: 'Detailed View', path: '/blogs/:id/details' }];

    useEffect(() => {
        if (id) {
            setPageData({
                author: {
                    id: state.payload.author.id,
                    firstName: state.payload.author.firstName,
                    lastName: state.payload.author.lastName,
                    mi: state.payload.author.mi,
                    avatarUrl: state.payload.author.avatarUrl,
                },
                blogStatus: { id: state.payload.blogStatus.id, name: state.payload.blogStatus.name },
                blogType: { id: state.payload.blogType.id, name: state.payload.blogType.name },
                content: state.payload.content,
                dateCreated: formatDateTime(state.payload.dateCreated),
                dateModified: formatDateTime(state.payload.dateModified),
                datePublished: formatDateTime(state.payload.datePublished),
                imageUrl: state.payload.imageUrl,
                isPublished: state.payload.isPublished,
                subject: state.payload.subject,
                title: state.payload.title,
                id: state.payload.id
            });
        }
    }, [id]);

    return (
        <>
            <div>
                <Container>
                    <Row>
                        <Col>
                            <Header title="Detailed View" crumbs={crumbs} />
                        </Col>
                    </Row>
                    <Link
                        className="link-btn btn btn-secondary btn-color-font text-white b-2 mb-2"
                        type="button"
                        to="/blogs">
                        Back
                    </Link>
                    <Row className="justify-content-center">
                        <Col>
                            <Card>
                                <Card.Body>
                                    <img src={pageData.imageUrl} className="card-img-top" alt="I love Code" />
                                    <div className="card-body">
                                        <p>Title: {pageData.title}</p>
                                        <p className="card-text">
                                            Author: {pageData.author.firstName} {pageData.author.mi}{' '}
                                            {pageData.author.lastName}
                                        </p>
                                        <p className="card-text">Subject: {pageData.subject}</p>
                                        <p className="card-text">Category: {pageData.blogType.name}</p>
                                        <p className="card-text">Content: {pageData.content}</p>
                                        <p className="card-text">Date Published: {pageData.datePublished}</p>
                                        <p className="card-text">Date Created: {pageData.dateCreated}</p>
                                        <p className="card-text">Date Modified: {pageData.dateModified}</p>
                                    </div>

                                    <div>
                                        <Comments 
                                        currentUser={props.currentUser}
                                        entityId={pageData?.id}
                                        entityTypeId={commentService.entityTypes.BLOG}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

BlogDetails.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.number.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
      })
}

export default React.memo(BlogDetails);
