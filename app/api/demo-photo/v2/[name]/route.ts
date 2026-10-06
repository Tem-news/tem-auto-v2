import sharp from 'sharp'
import photoManifest from '../../../../../data/demo-photo-render-manifest.json'

export const runtime = 'nodejs'
export const revalidate = 31536000

type DemoPhoto = { source: string; width: number; height: number; plates: number[][] }
const photos: Record<string, DemoPhoto> = photoManifest

export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const photo = Object.prototype.hasOwnProperty.call(photos, params.name) ? photos[params.name] : null
  if (!photo) return new Response('Photo not found', { status: 404 })

  try {
    const original = await fetch(`https://ukzuybqfuvhmygyivcnp.supabase.co${photo.source}`, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(15000)
    })
    if (!original.ok) return new Response('Photo unavailable', { status: 502 })

    const { width, height } = photo
    const masks = photo.plates.map(([x1, y1, x2, y2]) =>
      `<rect x="${x1}" y="${y1}" width="${x2 - x1 + 1}" height="${y2 - y1 + 1}" fill="#6e6e6e"/>`
    ).join('')
    const fontSize = Math.min(width * 0.125, height * 0.25)
    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${masks}
      <g transform="translate(${width / 2} ${height / 2}) rotate(-14) scale(${fontSize / 2048}) translate(-4754.5 525.5)">
        <path d="M188 -1493H827Q1112 -1493 1264.5 -1366.5Q1417 -1240 1417 -1006Q1417 -771 1264.5 -644.5Q1112 -518 827 -518H573V0H188ZM573 -1214V-797H786Q898 -797 959.0 -851.5Q1020 -906 1020 -1006Q1020 -1106 959.0 -1160.0Q898 -1214 786 -1214Z M2175 -504Q2063 -504 2006.5 -466.0Q1950 -428 1950 -354Q1950 -286 1995.5 -247.5Q2041 -209 2122 -209Q2223 -209 2292.0 -281.5Q2361 -354 2361 -463V-504ZM2722 -639V0H2361V-166Q2289 -64 2199.0 -17.5Q2109 29 1980 29Q1806 29 1697.5 -72.5Q1589 -174 1589 -336Q1589 -533 1724.5 -625.0Q1860 -717 2150 -717H2361V-745Q2361 -830 2294.0 -869.5Q2227 -909 2085 -909Q1970 -909 1871.0 -886.0Q1772 -863 1687 -817V-1090Q1802 -1118 1918.0 -1132.5Q2034 -1147 2150 -1147Q2453 -1147 2587.5 -1027.5Q2722 -908 2722 -639Z M3887 -815Q3840 -837 3793.5 -847.5Q3747 -858 3700 -858Q3562 -858 3487.5 -769.5Q3413 -681 3413 -516V0H3055V-1120H3413V-936Q3482 -1046 3571.5 -1096.5Q3661 -1147 3786 -1147Q3804 -1147 3825.0 -1145.5Q3846 -1144 3886 -1139Z M4567 -504Q4455 -504 4398.5 -466.0Q4342 -428 4342 -354Q4342 -286 4387.5 -247.5Q4433 -209 4514 -209Q4615 -209 4684.0 -281.5Q4753 -354 4753 -463V-504ZM5114 -639V0H4753V-166Q4681 -64 4591.0 -17.5Q4501 29 4372 29Q4198 29 4089.5 -72.5Q3981 -174 3981 -336Q3981 -533 4116.5 -625.0Q4252 -717 4542 -717H4753V-745Q4753 -830 4686.0 -869.5Q4619 -909 4477 -909Q4362 -909 4263.0 -886.0Q4164 -863 4079 -817V-1090Q4194 -1118 4310.0 -1132.5Q4426 -1147 4542 -1147Q4845 -1147 4979.5 -1027.5Q5114 -908 5114 -639Z M5435 -436V-1120H5795V-1008Q5795 -917 5794.0 -779.5Q5793 -642 5793 -596Q5793 -461 5800.0 -401.5Q5807 -342 5824 -315Q5846 -280 5881.5 -261.0Q5917 -242 5963 -242Q6075 -242 6139.0 -328.0Q6203 -414 6203 -567V-1120H6561V0H6203V-162Q6122 -64 6031.5 -17.5Q5941 29 5832 29Q5638 29 5536.5 -90.0Q5435 -209 5435 -436Z M7667 -190Q7593 -92 7504.0 -46.0Q7415 0 7298 0Q7093 0 6959.0 -161.5Q6825 -323 6825 -573Q6825 -824 6959.0 -984.5Q7093 -1145 7298 -1145Q7415 -1145 7504.0 -1099.0Q7593 -1053 7667 -954V-1120H8027V-113Q8027 157 7856.5 299.5Q7686 442 7362 442Q7257 442 7159.0 426.0Q7061 410 6962 377V98Q7056 152 7146.0 178.5Q7236 205 7327 205Q7503 205 7585.0 128.0Q7667 51 7667 -113ZM7431 -887Q7320 -887 7258.0 -805.0Q7196 -723 7196 -573Q7196 -419 7256.0 -339.5Q7316 -260 7431 -260Q7543 -260 7605.0 -342.0Q7667 -424 7667 -573Q7667 -723 7605.0 -805.0Q7543 -887 7431 -887Z M9246 -1085V-813Q9131 -861 9024.0 -885.0Q8917 -909 8822 -909Q8720 -909 8670.5 -883.5Q8621 -858 8621 -805Q8621 -762 8658.5 -739.0Q8696 -716 8793 -705L8856 -696Q9131 -661 9226.0 -581.0Q9321 -501 9321 -330Q9321 -151 9189.0 -61.0Q9057 29 8795 29Q8684 29 8565.5 11.5Q8447 -6 8322 -41V-313Q8429 -261 8541.5 -235.0Q8654 -209 8770 -209Q8875 -209 8928.0 -238.0Q8981 -267 8981 -324Q8981 -372 8944.5 -395.5Q8908 -419 8799 -432L8736 -440Q8497 -470 8401.0 -551.0Q8305 -632 8305 -797Q8305 -975 8427.0 -1061.0Q8549 -1147 8801 -1147Q8900 -1147 9009.0 -1132.0Q9118 -1117 9246 -1085Z" fill="white" fill-opacity="0.28" stroke="black" stroke-opacity="0.20"
          stroke-width="36.864" stroke-linejoin="round" paint-order="stroke"/>
      </g>
    </svg>`
    const image = await sharp(Buffer.from(await original.arrayBuffer()), { limitInputPixels: 40000000 })
      .rotate()
      .resize(width, height, { fit: 'fill' })
      .composite([{ input: Buffer.from(overlay) }])
      .jpeg({ quality: 91 })
      .toBuffer()

    return new Response(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch {
    return new Response('Photo unavailable', { status: 502 })
  }
}
