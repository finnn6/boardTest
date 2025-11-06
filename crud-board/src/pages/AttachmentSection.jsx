import { Button } from 'flowbite-react'
import { HiDocument, HiArrowDownTray } from 'react-icons/hi2'

function AttachmentSection({ files }) {
  // 백엔드에서 file_type으로 이미 구분해서 보내줌
  const imageFiles = files.filter(file => file.file_type === 'image')
  const documentFiles = files.filter(file => file.file_type === 'document')

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">첨부 파일</h3>

      {/* 이미지 파일들 */}
      {imageFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2 text-gray-700">이미지</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imageFiles.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={file.file_url}
                  alt={file.file_name}
                  className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  loading="lazy"
                  onClick={() => window.open(file.file_url, '_blank')}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.file_size_formatted}
                    </p>
                  </div>
                  {/* <Button
                    size="xs"
                    color="gray"
                    onClick={() => handleDownload(file.file_url, file.file_name)}
                    className="ml-2"
                  >
                    <HiArrowDownTray className="h-4 w-4" />
                  </Button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일반 파일들 */}
      {documentFiles.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2 text-gray-700">문서</h4>
          <div className="space-y-2">
            {documentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <HiDocument className="h-6 w-6 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.file_size_formatted}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttachmentSection