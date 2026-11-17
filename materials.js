'use strict';

const REFERENCE_MATERIALS = [
  {id:'people', no:1, title:'사람의 생활', category:'사람', tone:'#a75a36', wash:'#fff0dd', image:'people-realistic.jpg', intro:'옷차림, 체육 시간, 꽃구경!\n우리의 하루를 살펴봐요.',
    facts:[
      '이 마을의 옷 가게는 더운 때 입는 얇은 옷과 추운 때 입는 두꺼운 옷을 준비해요.',
      '학교에서는 날씨와 기온을 살펴 운동장 체육 수업을 계획해요.',
      '마을 사람들은 봄에 벚꽃을 보러 갈 날짜를 정해 함께 나들이해요.'
    ], question:'계절이 달라지면, 누구의 어떤 생활 모습이 달라질까요?', source:'수업용 가상 생활 자료', sourceLinks:[]},
  {id:'mosquito', no:2, title:'모기의 생활', category:'동물', tone:'#3c7a87', wash:'#e7f3f3', image:'mosquito-realistic.jpg', intro:'작은 모기는 언제, 어디서\n살아갈까요?',
    facts:[
      '우리나라의 작은빨간집모기는 주로 4월부터 10월까지 활동하는 것으로 관찰돼요.',
      '어린 모기인 유충은 물웅덩이처럼 물이 고인 곳에서 자라요.',
      '사람들은 모기가 집에 들어오지 못하게 창문에 방충망을 설치하기도 해요.'
    ], question:'활동하는 기간과 모기의 수는 같은 뜻일까요? 무엇을 더 알아야 할까요?', source:'질병관리청 자료를 쉽게 풀어씀', sourceLinks:[
      {label:'모기 활동 시기·방충망 (2026.9.9.)',url:'https://www.kdca.go.kr/bbs/kdca/42/312572/artclView.do'},
      {label:'유충이 사는 곳 (2025.7.18.)',url:'https://www.kdca.go.kr/kdca/2848/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGa2RjYSUyRjQyJTJGMjE1MzMyJTJGYXJ0Y2xWaWV3LmRvJTNG'}
    ]},
  {id:'frog', no:3, title:'개구리의 생활', category:'동물', tone:'#527833', wash:'#edf3dd', image:'frog-realistic.jpg', intro:'북방산개구리가 알을 낳는\n때를 살펴봐요.',
    facts:[
      '지리산의 북방산개구리는 겨울이 끝나 갈 무렵인 2~3월에 처음 알을 낳은 모습이 관찰돼요.',
      '북방산개구리가 알을 낳기 시작하는 때는 기온과 관련이 있어요.',
      '북방산개구리는 곤충 등을 먹어요. 먹이가 되는 생물이 나타나는 때도 살펴볼 필요가 있어요.'
    ], question:'겨울이 끝날 무렵 따뜻해지는 때도 빨라진다면, 어떤 일이 생길까요?', source:'환경부·국립공원관리공단 자료 (2017.2.13.)를 쉽게 풀어씀', sourceLinks:[
      {label:'북방산개구리 산란 관찰 자료',url:'https://www.me.go.kr/home/web/board/read.do?boardId=760940&boardMasterId=1&menuId=286'}
    ]},
  {id:'cherry', no:4, title:'벚나무의 생활', category:'식물', tone:'#a65372', wash:'#fcecf1', image:'cherry-realistic.jpg', intro:'봄을 알리는 벚꽃은\n언제 피어날까요?',
    facts:[
      '벚꽃이 피는 때는 봄철 기온의 영향을 받아요.',
      '같은 지역에서도 나무의 종류와 햇빛을 받는 정도 등에 따라 꽃 피는 때가 다를 수 있어요.',
      '사람들은 꽃이 피고 활짝 피는 때를 관찰하며 꽃구경할 시기를 생각해요.'
    ], question:'봄에 따뜻해지는 때도 달라진다면, 꽃과 사람의 생활은 어떻게 이어질까요?', source:'기상청 자료를 쉽게 풀어씀 · 3번은 수업용 생활 상황', sourceLinks:[
      {label:'벚꽃 개화와 기온 (2015.4.8.)',url:'https://www.kma.go.kr/daejeon/html/news/notice_view.jsp?articleno=6056&boardId=press2&pageNo=49'}
    ]}
];
