let toastBox = document.getElementById("toastBox");

let successMsg = '<i class="fa-solid fa-circle-check"></i> the file was uploaded';
let copyMsg = '<i class="fa-solid fa-circle-info"></i> the message was copied';
let errorMsg = '<i class="fa-solid fa-circle-xmark"></i> whoops an error happend';

function showToast(msg) {
    let toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerHTML = msg;
    toastBox.appendChild(toast);

    if (msg.includes('error')) {
        toast.classList.add("error")
    }

    if (msg.includes("invalid")) {
        toast.classList.add("invalid")
    }

    if (msg.includes("info")) {
        toast.classList.add("info")
    }

    setTimeout(() => {
        toast.remove();
    }, 1500)
}

document.addEventListener('DOMContentLoaded', function() {
    const tips = [
        "did you know you can drag and drop files here?",
        "did you know you can scroll down when you upload multiple files 🤯",
        "what do you call a moose with no name? a moose-quito",
    ];

    function getRandomTip() {
        const randomIndex = Math.floor(Math.random() * tips.length);
        return tips[randomIndex];
    }

    document.getElementById('tip').textContent = getRandomTip();

    const fileInput = document.getElementById('file-upload');
    const uploadLabel = document.querySelector('.upload-label');
    const submitButton = document.getElementById('submit-button');
    const uploadForm = document.getElementById('upload-form');
    const uploadsDiv = document.getElementById('uploads');
    const uploadTemplate = document.querySelector('.upload-field');
    const uploadSeparator = document.getElementById('upload-separator');
    const dropArea = document.getElementById('drop-area');

    fileInput.addEventListener('change', function(event) {
        const fileName = event.target.files[0] ? event.target.files[0].name : '';
        if (fileName) {
            uploadLabel.textContent = fileName;
            submitButton.style.display = 'block';
        } else {
            uploadLabel.textContent = 'click here to input a file';
            submitButton.style.display = 'none';
        }
    });

     dropArea.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', function() {
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', function(event) {
        event.preventDefault();
        dropArea.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            uploadLabel.textContent = files[0].name;
            submitButton.style.display = 'block';
        }
    });

    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(uploadForm);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(successMsg)

                uploadsDiv.style.display = 'flex';
                uploadSeparator.style.display = 'block';

                const newUploadField = uploadTemplate.cloneNode(true);
                newUploadField.style.display = 'block';

                newUploadField.querySelector('.upload-name').textContent = data.fileName;
                const linkElement = newUploadField.querySelector('.upload-link');
                linkElement.href = data.downloadLink;
                linkElement.textContent = data.downloadLink;

                newUploadField.querySelector('.upload-cb').addEventListener('click', function() {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(linkElement.textContent)
                            .then(() => {
                                showToast(copyMsg)
                            })
                            .catch(err => {
                                console.error('failed to copy link:', err);
                                showToast(errorMsg)
                            });
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = linkElement.textContent;
                        textarea.style.visibility = 'hidden';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                    }
                });

                uploadsDiv.prepend(newUploadField);

                fileInput.value = '';
                uploadLabel.textContent = 'click here to input a file';
                submitButton.style.display = 'none';
            } else {
                showToast(errorMsg)
            }
        })
        .catch(error => {
            console.error(error);
            showToast(errorMsg)
        });
    });
});