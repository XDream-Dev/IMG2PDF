// Import jsPDF (make sure to include this in your project)
// You can add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const { jsPDF } = window.jspdf;
    let currentPDF = null;
    let currentImageData = null;
    let currentTab = 'device';
    let selectedFiles = []; // Add array to store multiple files
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    // Removed unused variable 'tabContents'
    

    //tab switching with animation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            if (currentTab === tabId) return;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Animate out current tab
            const currentActiveTab = document.querySelector('.tab-content.active');
            if (currentActiveTab) {
                currentActiveTab.style.opacity = '0';
                currentActiveTab.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    currentActiveTab.classList.remove('active');
                    
                    // Animate in new tab
                    const newTab = document.getElementById(`${tabId}Tab`);
                    newTab.classList.add('active');
                    setTimeout(() => {
                        newTab.style.opacity = '1';
                        newTab.style.transform = 'translateY(0)';
                    }, 50);
                    
                    currentTab = tabId;
                }, 300);
            }
        }); // Ensure proper closing of the DOMContentLoaded event listener
    });
    
    // Device upload functionality
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const devicePreview = document.getElementById('devicePreview');
    const devicePreviewImage = document.getElementById('devicePreviewImage');
    const deviceFileName = document.getElementById('deviceFileName');
    const deviceFileSize = document.getElementById('deviceFileSize');
    const convertDeviceBtn = document.getElementById('convertDeviceBtn');
    const downloadDeviceBtn = document.getElementById('downloadDeviceBtn');
    const clearDeviceBtn = document.getElementById('clearDeviceBtn');
    // Removed unused variable 'loadingSpinner'
    
    // Dropbox elements
    const dropboxUrl = document.getElementById('dropboxUrl');
    const fetchDropboxBtn = document.getElementById('fetchDropboxBtn');
    const dropboxPreview = document.getElementById('dropboxPreview');
    const dropboxPreviewImage = document.getElementById('dropboxPreviewImage');
    const dropboxFileName = document.getElementById('dropboxFileName');
    const convertDropboxBtn = document.getElementById('convertDropboxBtn');
    const downloadDropboxBtn = document.getElementById('downloadDropboxBtn');
    const clearDropboxBtn = document.getElementById('clearDropboxBtn');
    
    // Google Drive elements
    const driveUrl = document.getElementById('driveUrl');
    const fetchDriveBtn = document.getElementById('fetchDriveBtn');
    const drivePreview = document.getElementById('drivePreview');
    const drivePreviewImage = document.getElementById('drivePreviewImage');
    const driveFileName = document.getElementById('driveFileName');
    const convertDriveBtn = document.getElementById('convertDriveBtn');
    const downloadDriveBtn = document.getElementById('downloadDriveBtn');
    const clearDriveBtn = document.getElementById('clearDriveBtn');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Handle file selection via button
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFiles);
    
    // Device tab buttons
    convertDeviceBtn.addEventListener('click', () => convertToPDF('device'));
    downloadDeviceBtn.addEventListener('click', downloadPDF);
    clearDeviceBtn.addEventListener('click', () => clearTab('device'));
    
    // Dropbox tab buttons
    fetchDropboxBtn.addEventListener('click', fetchDropboxImage);
    convertDropboxBtn.addEventListener('click', () => convertToPDF('dropbox'));
    downloadDropboxBtn.addEventListener('click', downloadPDF);
    clearDropboxBtn.addEventListener('click', () => clearTab('dropbox'));
    
    // Drive tab buttons
    fetchDriveBtn.addEventListener('click', fetchDriveImage);
    convertDriveBtn.addEventListener('click', () => convertToPDF('drive'));
    downloadDriveBtn.addEventListener('click', downloadPDF);
    clearDriveBtn.addEventListener('click', () => clearTab('drive'));
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        selectedFiles = Array.from(files).filter(file => file.type.match('image.*'));
        
        if (selectedFiles.length === 0) {
            alert('Please select image files (JPEG, PNG, etc.)');
            return;
        }
        
        showLoading(true);
        
        // Create preview container if it doesn't exist
        let previewGrid = document.getElementById('previewGrid');
        if (!previewGrid) {
            previewGrid = document.createElement('div');
            previewGrid.id = 'previewGrid';
            previewGrid.className = 'preview-grid';
            devicePreview.appendChild(previewGrid);
        }
        
        // Clear existing previews
        previewGrid.innerHTML = '';
        
        // Show the preview container
        devicePreview.style.display = 'block';
        
        // Process each file
        let processedCount = 0;
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const previewCard = document.createElement('div');
                previewCard.className = 'preview-card';
                
                // Create thumbnail container
                const thumbnailContainer = document.createElement('div');
                thumbnailContainer.className = 'thumbnail-container';
                
                // Create image preview
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'preview-thumbnail';
                img.alt = file.name;
                img.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                };
                thumbnailContainer.appendChild(img);
                
                // Create file info
                const fileInfo = document.createElement('div');
                fileInfo.className = 'file-info';
                
                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = file.name;
                fileName.title = file.name;
                
                const fileSize = document.createElement('div');
                fileSize.className = 'file-size';
                fileSize.textContent = formatFileSize(file.size);
                
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileSize);
                
                // Add remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-file';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = () => removeFile(index);
                
                previewCard.appendChild(thumbnailContainer);
                previewCard.appendChild(fileInfo);
                previewCard.appendChild(removeBtn);
                
                previewGrid.appendChild(previewCard);
                
                processedCount++;
                if (processedCount === selectedFiles.length) {
                    showLoading(false);
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Update total file info
        deviceFileName.textContent = `${selectedFiles.length} file(s) selected`;
        deviceFileSize.textContent = formatFileSize(selectedFiles.reduce((acc, file) => acc + file.size, 0));
    }
    
    function removeFile(index) {
        selectedFiles.splice(index, 1);
        
        // Refresh preview grid
        const previewGrid = document.getElementById('previewGrid');
        if (previewGrid) {
            previewGrid.innerHTML = '';
            
            // Reprocess remaining files
            selectedFiles.forEach((file, newIndex) => {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const previewCard = document.createElement('div');
                    previewCard.className = 'preview-card';
                    
                    const thumbnailContainer = document.createElement('div');
                    thumbnailContainer.className = 'thumbnail-container';
                    
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-thumbnail';
                    thumbnailContainer.appendChild(img);
                    
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name;
                    
                    const fileSize = document.createElement('div');
                    fileSize.className = 'file-size';
                    fileSize.textContent = formatFileSize(file.size);
                    
                    fileInfo.appendChild(fileName);
                    fileInfo.appendChild(fileSize);
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-file';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => removeFile(newIndex);
                    
                    previewCard.appendChild(thumbnailContainer);
                    previewCard.appendChild(fileInfo);
                    previewCard.appendChild(removeBtn);
                    
                    previewGrid.appendChild(previewCard);
                };
                
                reader.readAsDataURL(file);
            });
        }
        
        // Update total file info
        deviceFileName.textContent = `${selectedFiles.length} file(s) selected`;
        deviceFileSize.textContent = formatFileSize(selectedFiles.reduce((acc, file) => acc + file.size, 0));
        
        // If no files left, hide preview
        if (selectedFiles.length === 0) {
            devicePreview.style.display = 'none';
        }
    }
    
    function fetchDropboxImage() {
        const url = dropboxUrl.value.trim();
        if (!url) {
            alert('Please enter a Dropbox URL');
            return;
        }
        
        // Convert Dropbox URL to direct download link
        let directUrl = url;
        if (url.includes('www.dropbox.com')) {
            directUrl = url.replace('www.dropbox.com', 'dl.dropbox.com');
            directUrl = directUrl.replace('?dl=0', '?dl=1');
            // Remove any query parameters after ?dl=1
            directUrl = directUrl.split('?')[0] + '?dl=1';
        }
        
        showLoading(true);
        
        fetchImageFromUrl(directUrl, 'dropbox').then(() => {
            dropboxFileName.textContent = 'Dropbox Image';
            dropboxPreview.style.display = 'block';
            showLoading(false);
        }).catch(error => {
            console.error('Error fetching Dropbox image:', error);
            alert('Failed to fetch image from Dropbox. Please check the URL and try again.');
            showLoading(false);
        });
    }
    
    function fetchDriveImage() {
        const url = driveUrl.value.trim();
        if (!url) {
            alert('Please enter a Google Drive URL');
            return;
        }
        
        // Extract file ID from Google Drive URL
        let fileId = '';
        const match = url.match(/\/file\/d\/([^\/]+)/);
        if (match && match[1]) {
            fileId = match[1];
        } else {
            alert('Invalid Google Drive URL format');
            return;
        }
        
        // Use the correct Google Drive download URL format
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        
        showLoading(true);
        
        fetchImageFromUrl(directUrl, 'drive').then(() => {
            driveFileName.textContent = 'Google Drive Image';
            drivePreview.style.display = 'block';
            showLoading(false);
        }).catch(error => {
            console.error('Error fetching Drive image:', error);
            alert('Failed to fetch image from Google Drive. Please check the URL and try again.');
            showLoading(false);
        });
    }
    
    function fetchImageFromUrl(url, tab) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                // Create canvas to handle CORS and get data URL
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/jpeg');
                currentImageData = dataUrl;
                
                if (tab === 'dropbox') {
                    dropboxPreviewImage.src = dataUrl;
                } else if (tab === 'drive') {
                    drivePreviewImage.src = dataUrl;
                }
                
                resolve();
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    
    // Convert image to PDF
    function convertToPDF(tab) {
        if (tab === 'device' && selectedFiles.length === 0) {
            alert('Please select or upload images first');
            return;
        } else if (tab !== 'device' && !currentImageData) {
            alert('Please select or upload an image first');
            return;
        }

        let convertBtn;
        if (tab === 'device') convertBtn = convertDeviceBtn;
        else if (tab === 'dropbox') convertBtn = convertDropboxBtn;
        else if (tab === 'drive') convertBtn = convertDriveBtn;
        
        convertBtn.classList.add('converting');
        convertBtn.textContent = 'Converting...';
        showLoading(true);
        
        setTimeout(() => {
            try {
                if (tab === 'device' && selectedFiles.length > 0) {
                    // Create PDF for multiple files
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm'
                    });
                    
                    let currentPage = 1;
                    
                    // Process each file
                    const processNextFile = (index) => {
                        if (index >= selectedFiles.length) {
                            currentPDF = pdf;
                            finishConversion(convertBtn, tab);
                            return;
                        }
                        
                        const file = selectedFiles[index];
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            const img = new Image();
                            img.onload = function() {
                                if (index > 0) {
                                    pdf.addPage();
                                    currentPage++;
                                }
                                
                                const pageWidth = pdf.internal.pageSize.getWidth();
                                const pageHeight = pdf.internal.pageSize.getHeight();
                                
                                let imgWidth = img.width;
                                let imgHeight = img.height;
                                
                                const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95;
                                imgWidth *= ratio;
                                imgHeight *= ratio;
                                
                                const x = (pageWidth - imgWidth) / 2;
                                const y = (pageHeight - imgHeight) / 2;
                                
                                pdf.addImage(event.target.result, 'JPEG', x, y, imgWidth, imgHeight);
                                
                                // Process next file
                                processNextFile(index + 1);
                            };
                            
                            img.src = event.target.result;
                        };
                        
                        reader.readAsDataURL(file);
                    };
                    
                    // Start processing files
                    processNextFile(0);
                } else {
                    // Single image conversion (Dropbox/Drive)
                    const img = new Image();
                    img.onload = function() {
                        const pdf = new jsPDF({
                            orientation: img.width > img.height ? 'landscape' : 'portrait',
                            unit: 'mm'
                        });
                        
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        
                        let imgWidth = img.width;
                        let imgHeight = img.height;
                        
                        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95;
                        imgWidth *= ratio;
                        imgHeight *= ratio;
                        
                        const x = (pageWidth - imgWidth) / 2;
                        const y = (pageHeight - imgHeight) / 2;
                        
                        pdf.addImage(currentImageData, 'JPEG', x, y, imgWidth, imgHeight);
                        
                        currentPDF = pdf;
                        finishConversion(convertBtn, tab);
                    };
                    
                    img.onerror = function() {
                        convertBtn.classList.remove('converting');
                        convertBtn.textContent = 'Convert to PDF';
                        showLoading(false);
                        alert('Error loading image for PDF conversion');
                    };
                    
                    img.src = currentImageData;
                }
            } catch (error) {
                convertBtn.classList.remove('converting');
                convertBtn.textContent = 'Convert to PDF';
                showLoading(false);
                console.error('PDF conversion error:', error);
                alert('An error occurred during PDF conversion');
            }
        }, 100);
    }
    
    function finishConversion(convertBtn, tab) {
        convertBtn.classList.remove('converting');
        convertBtn.textContent = 'Convert to PDF';
        showLoading(false);
        
        const downloadBtn = tab === 'device' ? downloadDeviceBtn : 
                          tab === 'dropbox' ? downloadDropboxBtn : downloadDriveBtn;
        downloadBtn.disabled = false;
        downloadBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            downloadBtn.style.transform = 'scale(1)';
        }, 300);
        
        showNotification('✓ Conversion successful!');
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        notification.style.transform = 'translateY(20px)';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 50);
    }
    
    function downloadPDF() {
        if (!currentPDF) {
            alert('No PDF available to download. Please convert an image first.');
            return;
        }
        
        // Generate a filename based on the current time
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        currentPDF.save(`XDream.Dev-conversion-${timestamp}.pdf`);
    }
    

    //clear function with animation
    function clearTab(tab) {
        let previewElement, imageElement, fileNameElement, fileSizeElement, inputElement;
        
        if (tab === 'device') {
            previewElement = devicePreview;
            imageElement = devicePreviewImage;
            fileNameElement = deviceFileName;
            fileSizeElement = deviceFileSize;
            inputElement = fileInput;
            
            // Clear the selected files array
            selectedFiles = [];
            
            // Clear the preview grid
            const previewGrid = document.getElementById('previewGrid');
            if (previewGrid) {
                previewGrid.innerHTML = '';
            }
        } else if (tab === 'dropbox') {
            previewElement = dropboxPreview;
            imageElement = dropboxPreviewImage;
            fileNameElement = dropboxFileName;
            inputElement = dropboxUrl;
        } else if (tab === 'drive') {
            previewElement = drivePreview;
            imageElement = drivePreviewImage;
            fileNameElement = driveFileName;
            inputElement = driveUrl;
        }
        
        // Add hidden class to trigger fade out animation
        previewElement.classList.add('hidden');
        
        // Wait for animation to complete before resetting values
        setTimeout(() => {
            if (imageElement) imageElement.src = '';
            if (fileNameElement) fileNameElement.textContent = '';
            if (fileSizeElement) fileSizeElement.textContent = '';
            if (inputElement) inputElement.value = '';
            
            // Reset the preview container
            previewElement.style.display = 'none';
            previewElement.classList.remove('hidden');
            
            // Reset the file input
            if (tab === 'device' && fileInput) {
                fileInput.value = '';
            }
        }, 400);
        
        // Reset global variables
        currentImageData = null;
        currentPDF = null;
        
        // Disable download buttons
        downloadDeviceBtn.disabled = true;
        downloadDropboxBtn.disabled = true;
        downloadDriveBtn.disabled = true;
    }
    
    function showLoading(show) {
        if (show) {
            loadingSpinner.style.display = 'block';
        } else {
            loadingSpinner.style.display = 'none';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});


