<template>
  <div ref="app-container" class="app-container">
    <div ref="filter-container" class="filter-container">
      <el-input
        v-model="listQuery.title"
        class="filter-item"
        placeholder="书名"
        style="width: 200px"
        clearable
        @keydown.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
        @input="handleFilter"
      />
      <el-input
        v-model="listQuery.author"
        class="filter-item"
        placeholder="作者"
        style="width: 200px"
        clearable
        @keydown.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
        @input="handleFilter"
      />

      <el-select v-model="listQuery.category" placeholder="分类" class="filter-item" @change="handleSelect">
        <el-option
          v-for="item in categories"
          :key="item.category"
          :label="item.categoryText + '(' + item.num + ')'"
          :value="item.categoryText"
        />
      </el-select>
      <el-button
        v-waves
        type="primary"
        class="filter-item"
        icon="el-icon-search"
        style="margin-left: 20px"
        @click="handleFilter"
      >查询</el-button>
      <el-button
        v-waves
        type="primary"
        class="filter-item"
        icon="el-icon-edit"
        style="margin-left: 20px"
        @click="handleCreate"
      >新增</el-button>
      <el-checkbox v-model="showCover" label="显示封面" style="margin-left: 10px" />

    </div>
    <el-table
      v-loading="isloading"
      :data="list"
      border
      stripe
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column
        prop="id"
        label="Id"
        width="80"
        sortable="custom"
        align="center"
      />
      <el-table-column
        prop="title"
        label="书名"
        width="220"
        align="center"
      >
        <template v-slot="{row : { title }}">
          <span v-html="title" />
        </template>
      </el-table-column>
      <el-table-column
        label="作者"
        width="120"
        align="center"
      >
        <template v-slot="{row : { author }}">
          <span v-html="author" />
        </template>
      </el-table-column>
      <el-table-column
        prop="publisher"
        label="出版社"
        width="180"
        align="center"
      />
      <el-table-column
        prop="categoryText"
        label="分类"
        width="80"
        align="center"
      />
      <el-table-column
        prop="language"
        label="语言"
        align="center"
      />
      <el-table-column
        v-if="showCover"
        prop="cover"
        label="封面"
        width="120"
        align="center"
      >
        <template v-slot="{row : { cover }}">
          <a v-if="cover" :href="cover" target="_blank">
            <img :src="cover" class="cover">
          </a>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileName"
        label="文件名"
        width="180"
        align="center"
      />
      <el-table-column
        prop="createUser"
        label="上传人"
        align="center"
      >
        <template v-slot="{row: { createUser }}">
          <span>{{ createUser | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="updateDt"
        label="上传时间"
        align="center"
      >
        <template v-slot="{row: { updateDt }}">
          <span>{{ updateDt | timeFormatFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100"
      >
        <template v-slot="{ row }">
          <el-button type="text" size="small" icon="el-icon-view" />
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleEdit(row)" />
          <el-button type="text" size="small" icon="el-icon-delete" style="color: #f00" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.curPage"
      :limit.sync="listQuery.limit"
      @pagination="pagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import { getCategory, getList, deleteBook } from '@/api/book'
import { parseTime } from '@/utils'
export default {
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    valueFilter(value) {
      if (!value) {
        return '数据为空'
      }
      return value
    },
    timeFormatFilter(value) {
      if (!value) {
        return '数据为空'
      }
      return parseTime(value, '{y}-{m}-{d}')
    }
  },
  data() {
    return {
      listQuery: {
        title: '',
        author: '',
        category: '',
        curPage: 1,
        limit: 10,
        sort: '-id'
      },
      showCover: true,
      categories: [],
      list: [],
      stickyTop: 0,
      isloading: true,
      total: 0,
      defaultSort: {
        prop: 'id',
        order: 'descending'
      }
    }
  },
  created() {
    this.parseQuery()
    this.getCategory()
    this.getList(this.listQuery)
  },
  methods: {
    parseQuery() {
      const query = Object.assign({
        sort: '-id'
      }, this.$route.query)
      if (query) {
        query.curPage && (query.curPage = +query.curPage)
        query.limit && (query.limit = +query.limit)
      }
      const symbol = query.sort[0]
      const column = query.sort.slice(1)
      this.defaultSort = {
        prop: column,
        order: symbol === '-' ? 'descending' : 'ascending'
      }
      this.listQuery = {
        ...this.listQuery,
        ...query
      }
    },
    getCategory() {
      getCategory().then(res => {
        const { data } = res
        this.categories = data
      })
    },
    // 高亮搜索结果关键字
    wrapperKeyword(k, v) {
      const val = this.listQuery[k]
      if (val) {
        return v.replace(new RegExp(val, 'ig'), (value) => {
          return `<span style="color: #f40; font-size: 1.5em;">${value}</span>`
        })
      } else {
        return v
      }
    },
    getList() {
      getList(this.listQuery).then(res => {
        const { list, num } = res.data
        this.list = list
        this.total = num
        this.isloading = false
        list.forEach(item => {
          item.title = this.wrapperKeyword('title', item.title)
          item.author = this.wrapperKeyword('author', item.author)
        })
      })
    },
    refresh() {
      this.$router.push({
        path: '/book/list',
        query: this.listQuery
      })
    },
    handleFilter() {
      this.listQuery.curPage = 1
      this.getList()
      this.refresh()
    },
    handleSelect() {
      this.handleFilter()
    },
    handleCreate() {
      this.$router.push('/book/create')
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    handleEdit(row) {
      this.$router.push(`/book/edit/${row.fileName}`)
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除电子书， 是否继续？', '提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBook({
          fileName: row.fileName
        }).then(res => {
          const { msg } = res
          this.handleFilter()
          this.$message({
            message: msg,
            type: 'success'
          })
        })
      })
    },
    pagination(data) {
      const { page, limit } = data
      console.log(page)
      this.listQuery.curPage = page
      this.listQuery.limit = limit
      this.refresh()
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList()
      }
    }
    next()
  }
}
</script>

<style scoped lang="scss">
.app-container{
  .filter-container{
    .filter-item{

    }
  }
  .cover{
    width: 100%;
  }
}
</style>
