import styles from './DreamBigMarquee.module.scss'

const MarqueeItem = () => (
  <span className="flex shrink-0 items-center gap-10 pr-10" aria-hidden="true">
    <span>Dream big earn bigger!</span>
    <span className={styles.marqueeLogo} />
  </span>
)

export default function DreamBigMarquee() {
  return (
    <div className="z-20 w-full overflow-hidden py-2 md:py-4">
      <div
        className="w-full scale-[1.02] rotate-1 overflow-hidden border-y-2 border-yellow py-1 text-yellow md:py-3"
        aria-label="Dream big earn bigger!"
      >
        <div
          className={`${styles.marqueeTrack} flex w-max whitespace-nowrap text-[38px] font-light uppercase leading-none md:text-[64px]`}
        >
          <div className="flex shrink-0">
            <MarqueeItem />
            <MarqueeItem />
          </div>
          <div className="flex shrink-0">
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>
      </div>
    </div>
  )
}
