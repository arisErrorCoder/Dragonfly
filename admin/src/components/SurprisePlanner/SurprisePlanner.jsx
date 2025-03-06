import React, { useState, useEffect } from 'react';
import { fireDB, storage } from '../firebase'; // Assume firebase is properly initialized
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './SurprisePlanner.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('category');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [name, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Added description field
  const [images, setImages] = useState([]); // State for images
  const [imagePreviews, setImagePreviews] = useState([]); // State for image previews
  const [categoryDropdown, setCategoryDropdown] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [includes, setIncludes] = useState([]);
  const [exclusions, setExclusions] = useState([]); // New exclusions state
  const [faqs, setFaqs] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [includeInput, setIncludeInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState(''); // Input for exclusions
  const [faqInput, setFaqInput] = useState('');
  const [additionalInfoInput, setAdditionalInfoInput] = useState('');
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null); // To track package being edited

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(fireDB, 'categories'));
      const categoryList = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  // Fetch packages from Firestore
  useEffect(() => {
    const fetchPackages = async () => {
      const packageSnapshot = await getDocs(collection(fireDB, 'surpriseplannerpackages'));
      const packageList = packageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPackages(packageList);
    };
    fetchPackages();
  }, []);

  // Handle adding a new category
  const addCategory = async () => {
    if (category.trim() !== '') {
      const docRef = await addDoc(collection(fireDB, 'categories'), { name: category });
      setCategories([...categories, { id: docRef.id, name: category }]);
      setCategory('');
    }
  };

  // Handle deleting a category
  const deleteCategory = async (id) => {
    await deleteDoc(doc(fireDB, 'categories', id));
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // Handle adding or updating a package
  const addPackage = async () => {
    if (name && categoryDropdown && price) {
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, `packages/${image.name}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        })
      );

      const newPackage = {
        name,
        description,
        category: categoryDropdown,
        price,
        discount,
        includes,
        exclusions,
        faqs,
        additionalInfo,
        images: uploadedImages.length > 0 ? uploadedImages : imagePreviews , // If new images were added, use them; otherwise, keep the previous images
        times_hearted: '0', // New field
        times_opened: '0', // New field
        times_booked: '0'  // New field
      };

      if (editingPackage) {
        // Edit existing package
        const updatedPackage = { ...editingPackage, ...newPackage }; // Merge with existing package
        await updateDoc(doc(fireDB, 'surpriseplannerpackages', editingPackage.id), updatedPackage);
        setPackages(packages.map(pkg => pkg.id === editingPackage.id ? { id: editingPackage.id, ...updatedPackage } : pkg));
      } else {
        // Add new package
        const docRef = await addDoc(collection(fireDB, 'surpriseplannerpackages'), newPackage);
        setPackages([...packages, { id: docRef.id, ...newPackage }]);
      }
      resetPackageForm();
    }
  };

  // Handle deleting a package
  const deletePackage = async (id) => {
    await deleteDoc(doc(fireDB, 'surpriseplannerpackages', id));
    setPackages(packages.filter(pkg => pkg.id !== id));
  };

  // Reset form after adding or editing
  const resetPackageForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setImagePreviews([]);
    setCategoryDropdown('');
    setPrice('');
    setDiscount('');
    setIncludes([]);
    setExclusions([]);
    setFaqs([]);
    setAdditionalInfo([]);
    setEditingPackage(null);
  };

  // Handle editing a package (pre-fill the form)
  const handleEditPackage = (pkg) => {
    setTitle(pkg.name);
    setDescription(pkg.description);
    setImages([]); // Reset image upload state
    setImagePreviews(pkg.images); // Set image previews when editing
    setCategoryDropdown(pkg.category);
    setPrice(pkg.price);
    setDiscount(pkg.discount);
    setIncludes(pkg.includes);
    setExclusions(pkg.exclusions);
    setFaqs(pkg.faqs);
    setAdditionalInfo(pkg.additionalInfo);
    setEditingPackage(pkg);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages(selectedImages);
    const previews = selectedImages.map(image => URL.createObjectURL(image));
    setImagePreviews(previews);
  };

  // Handle removing an image from the preview
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  return (
    <div className="supriseplanner">
      <h2>Admin Panel</h2>
      <div>
        <button onClick={() => setActiveTab('category')}>Manage Category</button>
        <button onClick={() => setActiveTab('surpriseplannerpackages')}>Manage Packages</button>
      </div>

      {activeTab === 'category' && (
        <div>
          <h4>Manage Categories</h4>
          <input
            type="text"
            placeholder="Enter Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button onClick={addCategory}>Add Category</button>

          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                {cat.name}
                <button className="delete-btn" onClick={() => deleteCategory(cat.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'surpriseplannerpackages' && (
        <div>
          <h4>Manage Packages</h4>
          <input
            type="text"
            placeholder="Package name"
            value={name}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Package Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Textarea for description
          />
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
          />
          
          {/* Image Previews */}
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview">
                <img src={preview} alt={`Preview ${index}`} />
                <button className="remove-btn" onClick={() => handleRemoveImage(index)}>Remove</button>
              </div>
            ))}
          </div>

          <select
            value={categoryDropdown}
            onChange={(e) => setCategoryDropdown(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />

          {/* Include Points */}
          <div className="section">
            <h4>Includes</h4>
            <input
              type="text"
              placeholder="Add point"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
            />
            <button onClick={() => {
              setIncludes([...includes, includeInput]);
              setIncludeInput('');
            }}>
              Add
            </button>
            <ul>
            {includes.map((include, idx) => (
                <li key={idx}>
                  {include}
                  <button className="delete-btn" onClick={() => setIncludes(includes.filter((_, i) => i !== idx))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          <div className="section">
            <h4>Exclusions</h4>
            <input
              type="text"
              placeholder="Add exclusion"
              value={exclusionInput}
              onChange={(e) => setExclusionInput(e.target.value)}
            />
            <button onClick={() => {
              setExclusions([...exclusions, exclusionInput]);
              setExclusionInput('');
            }}>
              Add
            </button>
            <ul>
            {exclusions.map((exclusion, idx) => (
                <li key={idx}>
                  {exclusion}
                  <button className="delete-btn" onClick={() => setExclusions(exclusions.filter((_, i) => i !== idx))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs */}
          <div className="section">
            <h4>FAQs</h4>
            <input
              type="text"
              placeholder="Add FAQ"
              value={faqInput}
              onChange={(e) => setFaqInput(e.target.value)}
            />
            <button onClick={() => {
              setFaqs([...faqs, faqInput]);
              setFaqInput('');
            }}>
              Add
            </button>
            <ul>
            {faqs.map((faq, idx) => (
                <li key={idx}>
                  {faq}
                  <button className="delete-btn" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Information */}
          <div className="section">
            <h4>Additional Information</h4>
            <input
              type="text"
              placeholder="Add additional info"
              value={additionalInfoInput}
              onChange={(e) => setAdditionalInfoInput(e.target.value)}
            />
            <button onClick={() => {
              setAdditionalInfo([...additionalInfo, additionalInfoInput]);
              setAdditionalInfoInput('');
            }}>
              Add
            </button>
            <ul>
            {additionalInfo.map((info, idx) => (
                <li key={idx}>
                  {info}
                  <button className="delete-btn" onClick={() => setAdditionalInfo(additionalInfo.filter((_, i) => i !== idx))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={addPackage}>
            {editingPackage ? 'Update Package' : 'Add Package'}
          </button>

          <ul>
            {packages.map((pkg) => (
              <li key={pkg.id}>
                {pkg.name}
                <button onClick={() => handleEditPackage(pkg)}>Edit</button>
                <button className="delete-btn" onClick={() => deletePackage(pkg.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
