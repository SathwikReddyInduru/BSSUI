import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  modifyCategory,
  clearSubmitState,
} from '@/store/slices/plmnSlices/voucherCategorySlice';

import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

const VIEW = {
  LIST: 'list',
  CREATE: 'create',
  MODIFY: 'modify',
};

const VoucherCategory = () => {
  const dispatch = useDispatch();

  const {
    list,
    loading,
    submitting,
    error,
    submitError,
    submitSuccess,
  } = useSelector((state) => state.voucherCategory);

  const [view, setView] = useState(VIEW.LIST);
  const [selected, setSelected] = useState(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const privileges = useSelector(
  (state) => state.auth.privileges
);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSubmitState());
        dispatch(fetchCategories());
        goToList();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [submitSuccess, dispatch]);

  const goToList = () => {
    setView(VIEW.LIST);
    setSelected(null);
    setCategoryName('');
    setCategoryDesc('');
    dispatch(clearSubmitState());
  };

  const openCreate = () => {
    dispatch(clearSubmitState());
    setCategoryName('');
    setCategoryDesc('');
    setView(VIEW.CREATE);
  };

  const openModify = (item) => {
    dispatch(clearSubmitState());
    setSelected(item);
    setCategoryDesc(item.categoryDesc);
    setView(VIEW.MODIFY);
  };

  const handleCreate = () => {
    if (!categoryName.trim() || !categoryDesc.trim()) return;

    dispatch(
      createCategory({
        categoryName: categoryName.trim(),
        categoryDesc: categoryDesc.trim(),
      })
    );
  };

  const handleModify = () => {
    if (!categoryDesc.trim()) return;

    dispatch(
      modifyCategory({
        categoryId: selected.categoryId,
        categoryDesc: categoryDesc.trim(),
      })
    );
  };

  const filteredList = list.filter((item) =>
    item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoryDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.categoryId)?.includes(searchTerm)
  );

  if (view === VIEW.LIST) {
    return (
      <div className="voucher-wrapper">

        <div className="voucher-top-row">
          <h2 className="voucher-title">
            Voucher Profile Categories
          </h2>

          <div className="voucher-actions">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="voucher-search"
            />

{hasPrivilege(privileges, PRIVILEGES.CREATE_CATEGORY) && (
            <button
              onClick={openCreate}
              className="create-btn"
            >
              + Create Category
            </button>)}
          </div>
        </div>

        <div className="voucher-table-card">
          {loading ? (
            <div className="empty-state">
              Loading categories...
            </div>
          ) : error ? (
            <div className="empty-state">
              {error}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state">
              No categories found
            </div>
          ) : (
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Category Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredList.map((item, index) => (
                  <tr key={item.categoryId}>
                    <td>{item.categoryId}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.categoryDesc}</td>
                    <td>

                      {hasPrivilege(privileges, PRIVILEGES.MODIFY_CATEGORY) && (
                      <button
                        className="edit-btn"
                        onClick={() => openModify(item)}
                      >
                        Edit
                      </button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (view === VIEW.CREATE) {
    return (
      <div className="voucher-wrapper">
        <button
          className="back-btn"
          onClick={goToList}
        >
          ← Back
        </button>

        {submitSuccess && (
          <div className="success-box">
            Category created successfully
          </div>
        )}

        {submitError && (
          <div className="error-box">
            {submitError}
          </div>
        )}

        <div className="form-card">
          <h3>Create Category</h3>

          <div className="form-group">
            <label>Category Name</label>
            <input
              value={categoryName}
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              value={categoryDesc}
              onChange={(e) =>
                setCategoryDesc(e.target.value)
              }
            />
          </div>

          <div className="form-buttons">
            <button
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            <button onClick={goToList}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === VIEW.MODIFY) {
    return (
      <div className="voucher-wrapper">
        <button
          className="back-btn"
          onClick={goToList}
        >
          ← Back
        </button>

        {submitSuccess && (
          <div className="success-box">
            Category updated successfully
          </div>
        )}

        {submitError && (
          <div className="error-box">
            {submitError}
          </div>
        )}

        <div className="form-card">
          <h3>Modify Category</h3>

          <div className="form-group">
            <label>Category Name</label>
            <input
              value={selected?.categoryName || ''}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              value={categoryDesc}
              onChange={(e) =>
                setCategoryDesc(e.target.value)
              }
            />
          </div>

          <div className="form-buttons">
            <button
              onClick={handleModify}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            <button onClick={goToList}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VoucherCategory;