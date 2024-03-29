<template>
  <div class="el-select" :class="[selectSize ? 'el-select--' + selectSize : '']" @click.stop="toggleMenu" v-clickoutside="handleClose">
    <div class="el-select__tags" v-if="multiple" ref="tags" :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }">
      <span v-if="collapseTags && selected.length">
        <el-tag
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="selected[0].hitState"
          type="info"
          @close="deleteTag($event, selected[0])"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
        </el-tag>
        <el-tag v-if="selected.length > 1" :closable="false" :size="collapseTagSize" type="info" disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <el-tag
          v-for="item in selected"
          :key="getValueKey(item)"
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="item.hitState"
          type="info"
          @close="deleteTag($event, item)"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>

      <input
        type="text"
        class="el-select__input"
        :class="[selectSize ? `is-${selectSize}` : '']"
        :disabled="selectDisabled"
        :autocomplete="autoComplete || autocomplete"
        @focus="handleFocus"
        @blur="softFocus = false"
        @keyup="managePlaceholder"
        @keydown="resetInputState"
        @keydown.down.prevent="navigateOptions('next')"
        @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption"
        @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag"
        @keydown.tab="visible = false"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        v-model="query"
        @input="debouncedQueryChange"
        v-if="filterable"
        :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }"
        ref="input"
      />
    </div>
    <el-input
      ref="reference"
      v-model="selectedLabel"
      type="text"
      :placeholder="currentPlaceholder"
      :name="name"
      :id="id"
      :autocomplete="autoComplete || autocomplete"
      :size="selectSize"
      :disabled="selectDisabled"
      :readonly="readonly"
      :validate-event="false"
      :class="{ 'is-focus': visible }"
      :tabindex="multiple && filterable ? '-1' : null"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.native="debouncedOnInputChange"
      @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false"
      @keydown.native.tab="visible = false"
      @paste.native="debouncedOnInputChange"
      @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false"
    >
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick"></i>
      </template>
    </el-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <el-select-menu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <div class="el-select-dropdown__wrap el-scrollbar__wrap" style="overflow: hidden;position: relative;">
          <recycle-scroller
            ref="virtualScroller"
            :items="data"
            :buffer="buffer"
            :key-field="keyField"
            :item-size="itemSize"
            class="scroller"
            :style="scrollerStyle"
          >
            <template #before>
              <slot name="before" />
            </template>
            <template #default="{ item, index, active }">
              <slot :item="item" :index="index" :active="active"> </slot>
            </template>
            <template #after>
              <slot name="after" />
            </template>
          </recycle-scroller>
          <template v-if="emptyText && (!allowCreate || loading || (allowCreate && _items.length === 0))">
            <slot name="empty" v-if="$slots.empty"></slot>
            <p class="el-select-dropdown__empty" v-else>
              {{ emptyText }}
            </p>
          </template>
        </div>
      </el-select-menu>
    </transition>
  </div>
</template>

<script>
import { Select } from 'element-ui';
import { RecycleScroller } from 'vue-virtual-scroller';
import { throttle } from '../../../utils/index'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  name: 'VirtualSelect',
  components: {
    ...Select.components,
    RecycleScroller
  },
  directives: {
    ...Select.directives
  },
  mixins: [Select],
  props: {
    ...Select.props,
    ...RecycleScroller.props,
    filterKey: String,
    itemSize: {
      type: Number,
      default: 32
    },
    buffer: {
      type: Number,
      default: 32
    }
  },
  data () {
    const selectDataFn = Select.data.bind(this);

    const defaultData = selectDataFn();
    return {
      ...defaultData,
      data: [...this.items]
    };
  },
  computed: {
    ...Select.computed,
    scrollerStyle () {
      const count = Math.min(this.data.length, 5);
      const height = this.itemSize * count;
      return `height: ${height}px`;
    }
  },
  watch: {
    items (val) {
      this.data = [...val];
    },
    visible (val) {
      if (val) {
        this.data = [...this.items];
      }
    }
  },
  created () {
    const createdFn = Select.created.bind(this);
    createdFn();
  },
  mounted () {
    const mountedFn = Select.mounted.bind(this);
    mountedFn();
  },

  methods: {
    ...Select.methods,
    handleQueryChange (val) {
      if (this.previousQuery === val || this.isOnComposition) return;
      if (this.previousQuery === null && (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')) {
        this.previousQuery = val;
        return;
      }
      this.previousQuery = val;
      this.$nextTick(() => {
        if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
      });
      this.hoverIndex = -1;
      if (this.multiple && this.filterable) {
        this.$nextTick(() => {
          const length = this.$refs.input.value.length * 15 + 20;
          this.inputLength = this.collapseTags ? Math.min(50, length) : length;
          this.managePlaceholder();
          this.resetInputHeight();
        });
      }
      if (this.remote && typeof this.remoteMethod === 'function') {
        this.hoverIndex = -1;
        this.remoteMethod(val);
      } else if (typeof this.filterMethod === 'function') {
        this.filterMethod(val);
        this.broadcast('ElOptionGroup', 'queryChange');
      } else if (this.filterKey) {
        console.log('queryChanged...', 'query', this.query);
        if (val) {
          this.data = this.items.filter(item => {
            const { filterKey } = this;
            // eslint-disable-next-line no-prototype-builtins
            return item.hasOwnProperty(filterKey) && item[filterKey].indexOf(val) > -1;
          });
        } else {
          this.data = [...this.items];
        }
        this.filteredOptionsCount = this.optionsCount;
        this.broadcast('ElOption', 'queryChange', val);
        this.broadcast('ElOptionGroup', 'queryChange');
      } else {
        // do nothing
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption();
      }
    },
    scrollToOption (option) {
      const $option = Array.isArray(option) ? option[0] : option;
      if ($option && $option.$vnode) {
        const { key } = $option.$vnode;
        this.$refs.virtualScroller.scrollToItem(key);
      }
    },
    // 重写select组件里边的方法
    handleOptionSelect: throttle(function ut (option, byClick) {
      if (this.multiple) {
        const value = (this.value || []).slice();
        const optionIndex = this.getValueIndex(value, option.value);
        if (optionIndex > -1) {
          value.splice(optionIndex, 1);
        } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
          value.push(option.value);
        }
        this.$emit('input', value);
        this.emitChange(value);
        if (option.created) {
          this.query = '';
          this.handleQueryChange('');
          this.inputLength = 20;
        }
        if (this.filterable) this.$refs.input.focus();
      } else {
        this.$emit('input', option.value);
        this.emitChange(option.value);
        this.visible = false;
      }
      this.isSilentBlur = byClick;
      this.setSoftFocus();
      if (this.visible) return;
      this.$nextTick(() => {
        this.scrollToOption(option);
      });
    }, 500)
  }
};
</script>
<style>
.virtaul-select {
  width: max-content;
}
.scroller {
  width: 100%;
  height: 274px;
}
.el-select-dropdown__item{
  list-style: none;
}
</style>
