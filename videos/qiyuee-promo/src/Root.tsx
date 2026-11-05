import { Composition } from 'remotion';
import { QiyueMain } from './Main';
import { TOTAL } from './timeline';

export const Root: React.FC = () => (
  <Composition
    id="QiyuePromo"
    component={QiyueMain}
    defaultProps={{ bgm: true }}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
