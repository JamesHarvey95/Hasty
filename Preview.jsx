import React, { useMemo } from 'react';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import { formatDateTime } from '../../utils/dateFormater';

function Preview({ typeOptions, statusOptions }) {
  const { values } = useFormikContext();

  const selectedType = useMemo(() => {
    if (Array.isArray(typeOptions)) {
      const index = typeOptions?.findIndex((type) => type.id === parseInt(values.blogType));
      if (index !== -1) {
        return typeOptions[index];
      }
    }
    return {};
  }, [typeOptions, values]);

  const selectedStatus = useMemo(() => {
    if (Array.isArray(statusOptions)) {
      const index = statusOptions?.findIndex((status) => status?.id === parseInt(values.statusType));
      if (index !== -1) {
        return statusOptions[index];
      }
    }
    return {};
  }, [statusOptions, values]);

  return (
    <div className="col-12">
      <div className="card-body border">
        <h4 className="mb-0 mt-2">Preview</h4>
        <div className="text-start mt-3">
          <p className="text-muted">Title: {values.title}</p>
          <p className="text-muted">Blog Type: {selectedType.name}</p>
          <p className="text-muted">Status Type: {selectedStatus?.name}</p>
          <p className="text-muted">First Name: {values.firstName}</p>
          <p className="text-muted">Middle Initial: {values.mi}</p>
          <p className="text-muted">Last Name: {values.lastName}</p>
          <p className="text-muted">Avatar URL: {values.avatarUrl}</p>
          <p className="text-muted">Subject: {values.subject}</p>
          <p className="text-muted">Content: {values.content}</p>
          <p className="text-muted">Image URL: {values.imageUrl}</p>
          <p className="text-muted">Date Published: {formatDateTime(values.datePublished)}</p>
        </div>
      </div>
    </div>
  );
}

Preview.propTypes = {
  typeOptions: PropTypes.shape({
    findIndex: PropTypes.string.isRequired,
  }).isRequired,
  statusOptions: PropTypes.shape({
    findIndex: PropTypes.string.isRequired,
  }).isRequired,
};

export default Preview;
