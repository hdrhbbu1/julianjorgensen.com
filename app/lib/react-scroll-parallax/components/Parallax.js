import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { offsetMin, offsetMax } from '../utils/propValidation';

export default class Parallax extends Component {
    static defaultProps = {
        disabled: false,
        offsetYMax: 0,
        offsetYMin: 0,
        offsetXMax: 0,
        offsetXMin: 0,
        fadeSpeed: null,
        slowerScrollRate: false, // determines whether scroll rate is faster or slower than standard scroll
        tag: 'div',
    };

    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        disabled: PropTypes.bool.isRequired,
        offsetXMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        offsetXMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        offsetYMax: offsetMax,
        offsetYMin: offsetMin,
        fadeSpeed: PropTypes.number,
        slowerScrollRate: PropTypes.bool.isRequired,
        tag: PropTypes.string.isRequired,
    };

    componentDidMount() {
        // add this Parallax element to the global listener
        if (typeof ParallaxController === 'undefined') {
            throw new Error(
                'Must initialize the ParallaxController before adding React Parallax components.'
            );
        }
        // create a new parallax element and save the reference
        this.element = ParallaxController.createElement({
            elInner: this._inner,
            elOuter: this._outer,
            props: {
                disabled: this.props.disabled,
                offsetXMax: this.props.offsetXMax,
                offsetXMin: this.props.offsetXMin,
                offsetYMax: this.props.offsetYMax,
                offsetYMin: this.props.offsetYMin,
                fadeSpeed: this.props.fadeSpeed,
                slowerScrollRate: this.props.slowerScrollRate,
            },
        });
    }

    componentWillReceiveProps(nextProps) {
        // updates the elements props when changed
        if (this.props !== nextProps) {
            ParallaxController.updateElement(this.element, {
                props: {
                    disabled: nextProps.disabled,
                    offsetXMax: nextProps.offsetXMax,
                    offsetXMin: nextProps.offsetXMin,
                    offsetYMax: nextProps.offsetYMax,
                    offsetYMin: nextProps.offsetYMin,
                    fadeSpeed: nextProps.fadeSpeed,
                    slowerScrollRate: nextProps.slowerScrollRate,
                },
            });
        }
        // resets element styles when disabled
        if (this.props.disabled !== nextProps.disabled && nextProps.disabled) {
            ParallaxController.resetElementStyles(this.element);
        }
    }

    componentWillUnmount() {
        ParallaxController.removeElement(this.element);
    }

    // refs
    mapRefOuter = ref => {
        this._outer = ref;
    };

    mapRefInner = ref => {
        this._inner = ref;
    };

    render() {
        const { children, className, tag: Tag } = this.props;

        const rootClass = 'parallax-outer' + (className ? ` ${className}` : '');

        return (
            <Tag className={rootClass} ref={this.mapRefOuter}>
                <div className="parallax-inner" ref={this.mapRefInner}>
                    {children}
                </div>
            </Tag>
        );
    }
}
