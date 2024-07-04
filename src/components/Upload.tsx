import {} from 'react';

export const Upload = () => {
  return (
    <>
      <div class="file-upload-container">
        <input type="file" id="file-upload" name="filename" accept=".jpg, .png, .svg" multiple />
        <button class="add-img">Add</button>
      </div>
      <div class="file-size-container">
        <div class="container-width">
          <span class="tool-label"> Width: </span>
          <input class="width" type="number" value="120" placeholder="width" />
        </div>
      </div>
      <div class="file-preview"></div>
    </>
  );
};
