import * as Yup from 'yup';

const blogSchema = Yup.object().shape({
    blogType: Yup.number().min(1).max(2147483647).required('Required'),
    firstName: Yup.string().min(2).max(100).required('Required'),
    mi: Yup.string().min(1).max(2),
    lastName: Yup.string().min(2).max(100).required('Required'),
    avatarUrl: Yup.string().min(2).max(500),
    statusType: Yup.number().min(1).max(2147483647).required('Required'),
    title: Yup.string().min(2).max(100).required('Required'),
    subject: Yup.string().min(2).max(50),
    content: Yup.string().min(2).max(4000).required('Required'),
    isPublished: Yup.bool().required().required('Required'),
    imageUrl: Yup.string().min(2).max(255),
    datePublished: Yup.date(),
});

export { blogSchema };
