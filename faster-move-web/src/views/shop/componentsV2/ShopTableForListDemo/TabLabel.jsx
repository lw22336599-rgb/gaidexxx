// TabLabel.tsx
import { defineComponent } from 'vue'
import VabIcon from '/@/components/VabIcon'

export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    return () => (
      <span class="tab-label">
        <span>{props.item.label}</span>
        {props.item.id !== 'home' && (
          <VabIcon
            icon={props.item.muted ? 'notification-off-fill' : 'notification-4-fill'}
            onClick={(e) => {
              e.stopPropagation()
              emit('toggle-mute', props.item.id)
            }}
          />
        )}
      </span>
    )
  }
})