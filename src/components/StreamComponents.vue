<template>
  <!-- Tabs with a loading indicator -->
  <el-date-picker
    v-model="startDate"
    type="date"
    placeholder="Start Date"
    style="margin-right: 10px;margin-bottom: 10px;margin-top: 10px"
  />
  <el-date-picker
    v-model="endDate"
    type="date"
    placeholder="End Date"
    style="=margin-bottom: 10px;margin-top: 10px"

  />

  <el-button type="primary" style="margin-left: 10px" @click="filterByDateRange">
    Filter by Date Range
  </el-button>
  <el-tabs type="border-card" class="demo-tabs" v-loading="isLoading">
    <el-tab-pane>
      <template #label>
        <span class="custom-tabs-label">
          <!-- Label for the "All Replays" tab -->
          <span>All Replays</span>
        </span>
      </template>

      <!-- Download button to trigger file downloads for selected rows -->
      <div style="margin-bottom: 10px; display: flex; gap: 10px;">
        <!-- Download 按钮 -->
        <el-button type="primary" @click="handleDownload">Download</el-button>

        <!-- Change Name 按钮 -->
        <el-button type="info" @click="toggleEdit">
          {{ isEditing ? "Save All" : "Change Name" }}
        </el-button>
      </div>
      <!-- Table displaying the replays data -->
      <el-table :data="tableDataGet" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />

        <el-table-column label="StreamNo" width="100" show-overflow-tooltip>
          <template #default="scope">{{ scope.row[1] }}</template>
        </el-table-column>

        <el-table-column label="DateTime" width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row[2] }}</template>
        </el-table-column>

        <el-table-column label="FileName" width="240" show-overflow-tooltip>
          <template #default="scope">
            <el-text v-show="!isEditing">{{ scope.row[0] }}</el-text>
            <el-input v-show="isEditing" v-model="editedNames[scope.row[0]]"></el-input>
          </template>
        </el-table-column>

        <el-table-column label="FileSize" width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row[3] }}MB</template>
        </el-table-column>

      </el-table>

    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import { onMounted, ref, toRaw } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import dayjs from 'dayjs';
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
import api from '@/main'
const originalData = ref([]);
export default {
  components: {
    // Component-specific imports go here if needed
  },
  setup() {


    const isEditing = ref(false);
    const editedNames = ref<Record<string, string>>({});
    // State variable to track loading status
    const dateFilters = ref([]);
    const startDate = ref(null); // Start date for filtering
    const endDate = ref(null);   // End date for filtering
    const isLoading = ref(false)
    const isChangeNameDisable = ref(true)
    // Array to hold selected rows from the table
    const selectedRows = ref([])
    const baseUrl = useStore().state.baseUrl

    // Array to store data fetched from the server for the replays
    const tableDataGet = ref([[] as tableDataGet[]])
    const isChangeingName = ref(false)
    const toggleEdit = async () => {
      if (isEditing.value) {
        console.log("Saving new names:", editedNames.value);

        for (const oldName in editedNames.value) {
          const newName = editedNames.value[oldName];

          if (!newName || newName.trim() === "" || newName === oldName) {
            console.warn(`Skipping rename: ${oldName} -> ${newName}`);
            continue;
          }

          try {
            const response = await axios.get(baseUrl + "/rename", {
              params: {
                oldName: oldName,
                newName: newName,
              },
            });

            if (response.data) {
              console.log(`Rename successful: ${oldName} -> ${newName}`);
            } else {
              console.error(`Rename failed: ${oldName} -> ${newName}`);
            }
          } catch (error) {
            console.error(`Error renaming file: ${oldName} -> ${newName}`, error);
          }
        }

        // 🚀 直接重新获取最新数据
        await getReplays();
      } else {
        // 进入编辑模式，初始化 `editedNames`
        tableDataGet.value.forEach(row => {
          editedNames.value[row[0]] = row[0]; // 用文件名作为 key，初始化值
        });
      }

      isEditing.value = !isEditing.value;
    };

    /**
     * Fetches replays data from the server and populates `tableDataGet`.
     * Sets the loading state while the request is in progress.
     */
    const  getReplays = () => {
      isLoading.value = true
      api({
        method: 'get',
        url: baseUrl + '/fetchreplays'
      }).then((res) => {
        originalData.value = res.data;
        tableDataGet.value = [...originalData.value]; // Populate the table data with response
        isLoading.value = false // Stop loading indicator
      })

    }

    const store = useStore() // Access Vuex store instance
    const filterStreamNo = (value:any, row:any) => {
      return row[1] === value;
    };

    /**
     * Handles row selection in the table and updates `selectedRows`.
     * @param selection The selected rows from the table
     */
    const handleSelectionChange = (selection:any) => {
      selectedRows.value = selection
      console.log('Currently selected rows: ', selectedRows.value)
    }

    /**
     * Downloads the files for each selected row by opening the file URL in a new tab.
     */
    const handleDownload = () => {
      for (let i = 0; i < selectedRows.value.length; i++) {
        // Construct the download URL for each selected file and open it
        window.open(store.state.fileBaseUrl + '/' + selectedRows.value[i][0])
      }
    }
    const filterByDateRange = () => {
      const startTimestamp = startDate.value ? dayjs(startDate.value).startOf('day').valueOf() : null;
      const endTimestamp = endDate.value ? dayjs(endDate.value).endOf('day').valueOf() : null;

      tableDataGet.value = originalData.value.filter((item) => {
        const itemDate = dayjs(item[2], 'MMM D HH:mm'); // Adjust date format as needed
        const itemTimestamp = itemDate.valueOf();

        if (startTimestamp && endTimestamp) {
          return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
        } else if (startTimestamp) {
          return itemTimestamp >= startTimestamp;
        } else if (endTimestamp) {
          return itemTimestamp <= endTimestamp;
        }
        return true;
      });
    };
    const getRole = () => {
      let token = Cookies.get('token');
      axios({
        method: 'post',
        url: `${baseUrl}/user/getRoleByToken`,
        data: {
          token: token
        },

      })
        .then((res) => {
          Cookies.set('role', res.data.data);
          isChangeNameDisable.value = false;
        })
    }
    const changeVideoName = () =>{
      isChangeingName.value = true

    }
    // Call getReplays when the component is mounted to load initial data
    onMounted(async () => {
      await getReplays()
      await getRole()
    })






    // Return state variables and methods to be used in the template
    return {
      tableDataGet,
      isLoading,
      handleSelectionChange,
      handleDownload,
      filterStreamNo,
      filterByDateRange,
      startDate,
      endDate,
      isChangeNameDisable,
      isChangeingName,
      changeVideoName,
      toggleEdit,
      editedNames,
      isEditing,
    }
  }
}
</script>

<style>
/* Style for the tab content area */
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

/* Style for the custom tab label with an icon */
.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}

/* Adjusts spacing for the label text */
.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
</style>
