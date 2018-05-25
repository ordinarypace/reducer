import Helpers from '@/helpers';
import Scheme from './scheme';

/**
 * @use
 * reducer.dispatch('action', ...options);
 * reducer.mapGetters(context, ['getters']);
 *
 * @param _
 * @returns {{Scheme: {state: {}, actions: {}, mutations: {}, getters: {}}, setModule: (function(*=)), dispatch: (function(*=, *)), mapGetters: (function(*))}}
 * @constructor
 */
const Reducer = _ => {
    let namespace;

    /**
     * @desc 하나의 모듈(state, actions, mutations, getters)를 스토어에 등록한다.
     * @param module
     */
    const set = (module) => {
        if(!Array.isArray(module)) module = [...module];

        module.map(v => {
            const { namespace, modules } = v;

            if(!module) throw new Error('Expected has Module!');
            else {
                Object.keys(Scheme).map(k => Object.keys(modules[k]).reduce((p, c) => {
                    if(!Helpers.object.has(p, namespace)) p[namespace] = {};

                    if(Helpers.object.has(p, c)) throw new Error('Exist KEY!');
                    else p[namespace][c] = modules[k][c];

                    return p;

                }, Scheme[k]));
            }
        });
    };

    /**
     * @desc 내부 Scheme 에서 state 값을 얻어온다.
     * @param namespace
     * @returns {*}
     */
    const getState = (namespace) => {
        if(!namespace) throw new Error('Must be have namespace!');

        return Scheme.state[namespace];
    };

    /**
     * @desc getter 를 얻어온다.
     * @param getter
     * @returns {{}}
     */
    const mapGetters = (context, getter) => {
        const { getters } = Scheme;
        const map = {};

        getter.map(v => {
            const namespace = Helpers.object.find(getters, v);

            map[v] = getters[namespace][v](getState(namespace));
        });

        Object.assign(context, { ...map });
    };

    /**
     * @desc action 과 mutations 의 bridge 역할을 하는 메소드.
     * @param type
     * @param payload
     */
    const commit = (type, payload) => {
        const { mutations } = Scheme;

        if(!Helpers.object.has(mutations[namespace], type)) throw new Error('Not found TYPE!');

        mutations[namespace][type].apply(null, [getState(namespace), payload]);
    };

    /**
     * @desc 등록 되어 있는 모듈에서 해당 action 을 실행한다.
     * @param action
     * @param payload
     */
    const dispatch = (action, payload) => {
        if(typeof action !== 'string') throw new Error('Action type must be STRING!');

        const { actions } = Scheme;

        namespace = Helpers.object.find(actions, action);

        if(!Helpers.object.has(actions[namespace], action)) throw new Error('Not found ACTION!');

        actions[namespace][action].apply(null, [{ commit }, payload]);
    };

    return {
        set,
        get state(){
            return Scheme.state;
        },
        dispatch,
        mapGetters
    };
};

export default Reducer;
