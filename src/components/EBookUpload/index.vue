<template>
  <div class="upload-container">
    <el-upload
      ref="upload"
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="fileList"
      :on-exceed="onExceed"
      :disabled="disabled"
      drag
      show-file-list
      accept="application/epub+zip"
      class="image-uploader"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">
        请将文件拖入图示框内或<em>点击上传</em>
      </div>
      <div v-else class="el-upload__text">
        图书已上传
      </div>
    <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
    </el-upload>
  </div>

</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  props: {
    // 上传的文件列表
    fileList: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      action: `${process.env.VUE_APP_BASE_API}/book/upload`
    }
  },
  computed: {
    // 向头部添加token
    headers() {
      return {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
  methods: {
    beforeUpload(file) {
      this.$emit('beforeUpload', file)
    },
    onSuccess(res, file, fileList) {
      const { code, msg, data } = res
      if (code === 0) {
        this.$message({
          message: msg,
          type: 'success'
        })
        this.$emit('onSuccess', data, file, fileList)
      } else {
        this.$message({
          message: msg || '上传失败',
          type: 'error'
        })
      }
    },
    onError(err, file, fileList) {
      const errMsg = (err.message && JSON.parse(err.message).msg) || '上传失败'
      this.$message({
        message: errMsg,
        type: 'error'
      })
      this.$emit('onError', err)
    },
    // 文件列表移除文件时的钩子
    onRemove(file, fileList) {
      this.$emit('onRemove', fileList)
    },
    // 文件超出个数限制时的钩子
    onExceed(files, fileList) {
      this.$message({
        message: '每次只能上传一本电子书',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.upload-container{
  width: 100%;
  height: 100%;
  .image-uploader {
    height: 100%;
  }
}
</style>
