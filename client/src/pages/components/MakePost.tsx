import { hostname } from 'os';
import { useState } from 'react'
import { useParams } from 'react-router-dom';
import httpClient from '../../httpClient';
import '../../styles/makepost.css';
import imageCompression from 'browser-image-compression';

import { hostURL } from '../../httpClient';
import { Button } from 'react-bootstrap';

const MakePost:React.FC<{func:Function}> = ({func}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<File>();
  const [fileName, setFileName] = useState("")
  const params = useParams();
  // console.log(posts)

  const [postToggle, switchPostToggle] = useState(false);

  const handleTitle = (e:string) => {
      if (e.length > 0) {
          switchPostToggle(true)
      }
      setTitle(e);
  }

  const [isLoading, setLoading] = useState(false)

  const submitPost = async () => {
    if (title.length > 0 && body.length > 0 && body.length < 4000) {
        try {
           if (media) {
            const formData = new FormData();
            formData.append('media', media)
            setLoading(true)
            const resp = await httpClient.post(hostURL + 'uploadimage', formData);
            console.log(resp.data) 
            const postresp = await httpClient.post(hostURL + 'makepost', {
                    title,
                    body,
                    "subforum": params.subforum,
                    "university": params.university,
                    "media": resp.data.fileid
            }); 
            func(postresp.data)
          } else{
              setLoading(true)
              const resp = await httpClient.post(hostURL + 'makepost', {
                title,
                body,
                "subforum": params.subforum,
                "university": params.university,
            });
            func(resp.data)
            }
            setTitle("");
            setBody("");
            switchPostToggle(false);
            setLoading(false);
            setMedia(undefined);
            setFileName('');

        } catch (error: any) {
            console.log(error)
        }
    }
} 

  const selectFile = (e:any) => {
    const ext = e.target.files[0].name.split('.').pop();
    const validext = ['jpg', 'jpeg', 'gif', 'png']
    for (let i=0; i <= validext.length; i++) {
      if (ext.toLowerCase() === validext[i]) {
        setFileName(e.target.files[0].name)
        const compress = async() => {
          try {
            const compressed = await imageCompression(e.target.files[0], {maxSizeMB:0.1})
            setMedia(compressed)
          } catch(error) {console.log(error)}
        } 
        if (ext != 'gif') {compress()}
        else {setMedia(e.target.files[0])}
        return;
      }
    }
    console.log('wrong file type', ext)
  }
  return (
    <div className='makepost'>
      <h2 className='create-post-head'>Create New Post</h2>
      <div className='makepost-form-wrapper'>
                  <input
                      className="makepost-input makepost-title"
                      placeholder="Title"
                      type='text'
                      maxLength={126}
                      value={title}
                      onChange={(e) => handleTitle(e.target.value)}
                  />
              {postToggle ?
              <div className='makepost-hidden-fields'>
                    <textarea
                        className='makepost-input makepost-body'
                        placeholder='Body'
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <label className='makepost-file-input-wrapper'>
                      <input
                          accept='.jpg, .jpeg, .png, .gif'
                          className='makepost-input makepost-file-input'
                          type="file"
                          onChange={selectFile}
                      />
                      Choose File
                    </label>
                    <p>{fileName}</p>

                {!isLoading? <Button disabled={false} className="red-btn makepost-submit" onClick={() => submitPost()}>Submit</Button>: <Button disabled={true} className="red-btn makepost-submit red-btn-disabled">Submit</Button>}
                <Button className="red-btn makepost-toggle" onClick={() => switchPostToggle(!postToggle)}>Hide</Button>
              </div>
              : <><Button className="red-btn makepost-toggle" onClick={() => switchPostToggle(!postToggle)}>Show</Button></> }
      </div>
    </div>
  )
}

export default MakePost