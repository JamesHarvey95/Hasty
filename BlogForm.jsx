import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Form as FormikForm, Formik, ErrorMessage, Field } from 'formik';
import swal from 'sweetalert2';
import { blogSchema } from '../../schemas/blogSchema';
import blogService from '../../services/blogService';
import lookUpService from '../../services/lookUpService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './blogstyles.css';
import Preview from './Preview';
import FileUploader from '../files/FileUploader';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import debug from 'sabio-debug';
import Header from '../elements/Header';

const _logger = debug.extend('BlogForm');

function BlogForm() {
  const [statusOptions, setStatusOptions] = useState({
    arrayOfBlogStatuses: [],
    blogStatusComponents: [],
    selectedOption: {
      id: 0,
      name: '',
    },
  });
  const [typeOptions, setTypeOptions] = useState({
    arrayOfBlogTypes: [],
    blogTypeComponents: [],
    selectedOption: {
      id: 0,
      name: '',
    },
  });

  const [formData, setFormData] = useState({
    blogType: 0,
    previewType: '',
    statusType: 0,
    previewStatus: '',
    title: '',
    firstName: '',
    lastName: '',
    mi: '',
    avatarUrl: '',
    subject: '',
    content: '',
    isPublished: false,
    imageUrl: '',
    datePublished: '',
  });

  const thing = useRef();
  const crumbs = [
    { name: 'Apps', path: '/apps' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Add', path: '/blogs/new' },
  ];
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      thing?.current?.watchdog._editor.setData(`<p>${state.payload.content}</p>`);
      setFormData({
        blogType: state.payload.blogType?.id,
        statusType: state.payload.blogStatus?.id,
        title: state.payload.title,
        firstName: state.payload.author.firstName,
        lastName: state.payload.author.lastName,
        mi: state.payload.author.mi,
        avatarUrl: state.payload.author.avatarUrl,
        subject: state.payload.subject,
        content: state.payload.content,
        isPublished: state.payload.isPublished,
        imageUrl: state.payload.imageUrl,
        datePublished: state.payload.datePublished,
      });
    }
  }, [id]);

  const parentHandleSingleUploadSuccess = (response, setFieldValue) => {
    setFieldValue('imageUrl', response.items[0].url);
  };

  useEffect(() => {
    lookUpService.LookUp(['BlogTypes', 'BlogStatus']).then(onGetTypesSuccess).catch(onGetError);
  }, []);

  const onGetTypesSuccess = (response) => {
    let arrayOfTypes = response.item.blogTypes;
    let arrayOfStats = response.item.blogStatus;
    setTypeOptions((prevState) => {
      const to = { ...prevState };
      to.arrayOfBlogTypes = arrayOfTypes || [];
      to.blogTypeComponents = arrayOfTypes.map(mapBlogType);
      return to;
    });
    setStatusOptions((prevState) => {
      const so = { ...prevState };
      so.arrayOfBlogStatuses = arrayOfStats;
      so.blogStatusComponents = arrayOfStats.map(mapBlogStatus);
      return so;
    });
  };

  const onGetError = () => {
    swal.fire('Error', 'Blog types unavailable', 'error');
  };

  const mapBlogType = (blogType) => {
    return (
      <option key={'BlogTypeOption' + blogType.id} value={blogType.id}>
        {blogType.name}
      </option>
    );
  };

  const mapBlogStatus = (blogStatus) => {
    return (
      <option key={'BlogStatusOption' + blogStatus.id} value={blogStatus.id}>
        {blogStatus.name}
      </option>
    );
  };

  const handleSubmit = (values) => {
    values.blogTypeId = parseInt(values.blogType);
    values.blogStatusId = parseInt(values.statusType);
    blogService.post(values).then(onPostSuccess).catch(onPostError);
  };

  const handleEdit = (values) => {
    values.blogTypeId = parseInt(values.blogType);
    values.blogStatusId = parseInt(values.statusType);
    blogService.edit(id, values).then(onEditSuccess).catch(onEditError);
  };

  const onPostSuccess = () => {
    swal.fire('Good Job!!', 'You just created a blog post!', 'success', {
      button: 'Ok',
    });
    navigate(`/blogs`);
  };

  const onPostError = () => {
    swal.fire('Error', 'Blog post unsuccessful', 'error');
  };

  const onEditSuccess = () => {
    swal.fire('Good Job!!', 'You just created a blog post!', 'success', {
      button: 'Ok',
    });
    navigate(`/blogs`);
  };

  const onEditError = () => {
    swal.fire('Error', 'Blog post unsuccessful', 'error');
  };

  return (
    <>
      <div>
        <Container>
          <Row>
            <Col>
              <Header title="Add Blog" crumbs={crumbs} />
            </Col>
          </Row>
          <Link className="link-btn btn btn-secondary btn-color-font text-white b-2 mb-2" type="button" to="/blogs">
            Back
          </Link>
          <Row className="justify-content-center">
            <Col>
              <Card>
                <Card.Body className="p-4">
                  <div className="text-center w-75 m-auto">
                    <h3 className="text-muted mb-4">{'Share the story of how we helped you find your new home.'}</h3>
                  </div>
                  <Formik
                    enableReinitialize={true}
                    initialValues={formData}
                    onSubmit={id ? handleEdit : handleSubmit}
                    validationSchema={blogSchema}>
                    {({ setFieldValue, handleChange, values }) => (
                      <FormikForm>
                        <div className="contianer">
                          <div className="row">
                            <div className="col-md-6 mx-auto">
                              <div className="forms">
                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Title</h5>
                                  <Field
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="text-muted form-control w-100"
                                    placeholder="Title of your blog post"
                                    value={values?.title}
                                  />
                                  <ErrorMessage name="title" component="div" className="has-error" />
                                </div>

                                <div className="form-group">
                                  <h5 className="mb-3 mt-4">Blog Type</h5>
                                  <Field
                                    as="select"
                                    name="blogType"
                                    value={parseInt(values?.blogType)}
                                    className="form-control">
                                    <option>select option</option>
                                    {typeOptions.arrayOfBlogTypes?.map((type) => (
                                      <option key={type.name} value={type.id}>
                                        {type.name}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage name="blogType" component="div" className="has-error" />
                                </div>

                                <div className="form-group">
                                  <h5 className="mb-3 mt-4">Status Type</h5>
                                  <Field
                                    as="select"
                                    name="statusType"
                                    id="statusType"
                                    value={parseInt(values?.statusType)}
                                    className="form-control">
                                    <option value="0">Please Select a Status Type</option>
                                    {statusOptions.arrayOfBlogStatuses?.map((status) => (
                                      <option key={status.name} value={status.id}>
                                        {status.name}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage name="statusType" component="div" className="has-error" />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">First Name</h5>
                                  <Field
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    className="text-muted form-control w-100"
                                    placeholder="First Name"
                                    value={values?.firstName}
                                  />
                                  <ErrorMessage name="firstName" component="div" className="has-error" />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Middle Initial</h5>
                                  <Field
                                    type="text"
                                    name="mi"
                                    id="mi"
                                    className="text-muted form-control w-100"
                                    placeholder="Middle Initial"
                                    value={values?.mi}
                                  />
                                  <ErrorMessage name="mi" component="div" className="has-error" />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Last Name</h5>
                                  <Field
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    className="text-muted form-control w-100"
                                    placeholder="Last Name"
                                    value={values?.lastName}
                                  />
                                  <ErrorMessage name="lastName" component="div" className="has-error" />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Avatar URL</h5>
                                  <Field
                                    type="text"
                                    name="avatarUrl"
                                    id="avatarUrl"
                                    className="text-muted form-control w-100"
                                    placeholder="Avatar URL"
                                    value={values?.avatarUrl}
                                  />
                                  <ErrorMessage name="avatarUrl" component="div" className="has-error" />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Subject</h5>
                                  <Field
                                    type="text"
                                    className="text-muted form-control w-100"
                                    name="subject"
                                    id="subject"
                                    placeholder="Subject of blog post"
                                    value={values?.subject}
                                  />
                                </div>

                                <div className="mb-3">
                                  <h5 className="mb-3 mt-4">Content</h5>
                                  <CKEditor
                                    className="text-muted"
                                    editor={ClassicEditor}
                                    onReady={(editor) => {
                                      editor.setData(`<p>${values.content}</p>`);
                                    }}
                                    onChange={(event, editor) => {
                                      _logger('ckeditor onchange', { ...event });
                                      const data = editor.getData().replace('<p>', '').replace('</p>', '');
                                      setFieldValue('content', data);
                                    }}
                                    placeholder="Write a blog post"
                                    name="content"
                                    as="input"
                                    ref={thing}
                                  />
                                  <ErrorMessage name="content" component="div" className="has-error" />
                                </div>

                                <Row className="g-2">
                                  <Col sm={6}>
                                    <Form.Group>
                                      <div className="mb-3">
                                        <label htmlFor="formFile" className="form-label">
                                          Image URL
                                        </label>
                                        <FileUploader
                                          isMultiple={false}
                                          value={values?.imageUrl}
                                          handleUploadSuccess={(response) =>
                                            parentHandleSingleUploadSuccess(response, setFieldValue)
                                          }></FileUploader>
                                      </div>
                                    </Form.Group>
                                  </Col>
                                </Row>

                                <div className="md-3">
                                  <h5 className="mb-3 mt-4">Date Published</h5>
                                  <input
                                    label="Date Published"
                                    className="text-muted form-control"
                                    type="date"
                                    name="datePublished"
                                    value={values.datePublished ? values.datePublished.slice(0, 10) : ''}
                                    onChange={handleChange}
                                  />
                                  <ErrorMessage name="datePublished" component="div" className="has-error" />
                                  <h5 className="mb-3 mt-4"> </h5>
                                </div>

                                <Field
                                  type="checkbox"
                                  name="isPublished"
                                  className="me-1 text-muted"
                                  checked={values.isPublished}
                                />
                                <label className="form-check-label"> Publish?</label>

                                <div className="mb-3 mb-0 text-center">
                                  <Button
                                    variant="primary"
                                    type="submit"
                                    name="submit"
                                    className="btn btn-lg btn-secondary submit">
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mx-auto">
                              <div className="preview1 col-12">
                                <Card className="">
                                  <div>
                                    <Preview
                                      formData={formData}
                                      statusOptions={statusOptions.arrayOfBlogStatuses}
                                      typeOptions={typeOptions.arrayOfBlogTypes}
                                    />
                                  </div>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormikForm>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default BlogForm;
