import { getImagePath } from '../../utils/pathUtils';

export const products = [
  {
    id: 1,
    series: '全新艺术创作系列',
    name: '经典定制款',
    englishName: 'Classic Custom Portrait',
    slogan: '定格经典，隽永流传',
    image: getImagePath('the_lobby/TheClassicPortrait_lobby.png'),
    guideImage: getImagePath('ShowThesePicturesWhenAskForPhotos/TheClassicPortrait_Need3Photos.png'),
    petSupport: '支持单/双/多宠',
    priceRange: '￥328 起',
    isMultiPet: true,
    photoUploadLimit: 3
  },
  {
    id: 2,
    series: '全新艺术创作系列',
    name: '名画致敬款',
    englishName: 'Masterpiece Homage Portrait',
    slogan: '与艺术大师共创爱宠杰作',
    image: getImagePath('the_lobby/TheMasterpieceHomage_lobby.png'),
    guideImage: getImagePath('ShowThesePicturesWhenAskForPhotos/TheMasterpieceHomage_Need3Photos.png'),
    petSupport: '仅限单宠',
    priceRange: '￥358 起',
    isMultiPet: false,
    photoUploadLimit: 3
  },
  {
    id: 3,
    series: '参考照片创作系列',
    name: '姿态保留款',
    englishName: 'Pose-Only Recreation Style',
    slogan: '熟悉的身影，全新的故事',
    image: getImagePath('the_lobby/Pose-OnlyRecreationStyle_lobby.png'),
    guideImage: getImagePath('ShowThesePicturesWhenAskForPhotos/Pose-OnlyRecreationStyle_Need1Photo.png'),
    petSupport: '支持单/双/多宠',
    priceRange: '￥328 起',
    isMultiPet: true,
    photoUploadLimit: 1
  },
  {
    id: 4,
    series: '参考照片创作系列',
    name: '场景复刻款',
    englishName: 'Full Recreation Style',
    slogan: '复刻回忆，温暖重现',
    image: getImagePath('the_lobby/TheSceneRecreation_lobby.png'),
    guideImage: getImagePath('ShowThesePicturesWhenAskForPhotos/TheSceneRecreation_Need1Photo.png'),
    petSupport: '支持单/双/多宠',
    priceRange: '￥328 起',
    isMultiPet: true,
    photoUploadLimit: 1
  },
];